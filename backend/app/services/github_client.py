import re
import base64
import asyncio
from typing import Tuple, Dict, Any, Optional, List
import httpx
from ..config import settings

class GitHubAPIError(Exception):
    def __init__(self, message: str, status_code: int = 500, reset_time: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.reset_time = reset_time

class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "GitHub-Project-Health-Analyzer/1.0"
        }
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    @staticmethod
    def parse_repository_url(url: str) -> Tuple[str, str]:
        """
        Parses and validates a GitHub repository URL into (owner, repo).
        Supports:
        - https://github.com/owner/repo
        - http://github.com/owner/repo/
        - github.com/owner/repo
        - owner/repo
        """
        if not url or not isinstance(url, str):
            raise ValueError("Repository URL must be a non-empty string.")

        clean_url = url.strip()
        # Remove trailing slashes and .git
        clean_url = re.sub(r"\.git/?$", "", clean_url)
        clean_url = clean_url.rstrip("/")

        # Regex for supported formats
        match = re.search(
            r"^(?:https?://)?(?:www\.)?(?:github\.com/)?([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)$",
            clean_url
        )
        if not match:
            raise ValueError(
                "Invalid GitHub repository URL. Expected format: https://github.com/owner/repository"
            )

        owner, repo = match.group(1), match.group(2)
        if not owner or not repo:
            raise ValueError("Repository owner or name is missing.")

        return owner, repo

    async def _get(self, client: httpx.AsyncClient, endpoint: str) -> Tuple[int, Any, Dict[str, str]]:
        url = f"{self.BASE_URL}{endpoint}"
        try:
            resp = await client.get(url, headers=self.headers, timeout=12.0)
            status = resp.status_code
            headers = dict(resp.headers)
            
            # Check rate limit specifically
            if status == 403 and "rate limit" in resp.text.lower():
                reset_ts = int(headers.get("x-ratelimit-reset", "0"))
                raise GitHubAPIError(
                    "GitHub API rate limit exceeded. Please configure a personal access token or wait for the quota to reset.",
                    status_code=429,
                    reset_time=reset_ts
                )

            if status == 404:
                return status, None, headers

            if status >= 400:
                data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
                msg = data.get("message", f"GitHub API responded with status {status}")
                return status, None, headers

            data = resp.json()
            return status, data, headers
        except httpx.TimeoutException:
            raise GitHubAPIError("Request to GitHub API timed out.", status_code=504)
        except httpx.RequestError as e:
            raise GitHubAPIError(f"Network error contacting GitHub API: {str(e)}", status_code=502)

    async def get_rate_limit(self) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            status, data, _ = await self._get(client, "/rate_limit")
            if status != 200 or not data:
                return {
                    "limit": 60 if not settings.GITHUB_TOKEN else 5000,
                    "remaining": 0,
                    "reset_timestamp": 0,
                    "is_authenticated": bool(settings.GITHUB_TOKEN)
                }
            rate = data.get("rate", {})
            return {
                "limit": rate.get("limit", 60),
                "remaining": rate.get("remaining", 0),
                "reset_timestamp": rate.get("reset", 0),
                "is_authenticated": bool(settings.GITHUB_TOKEN)
            }

    async def fetch_full_repo_data(self, owner: str, repo: str) -> Dict[str, Any]:
        """
        Fetches all necessary endpoints concurrently:
        1. Repo metadata
        2. Recent commits
        3. README
        4. Issues (contains issues and PRs)
        5. Pull Requests
        6. Contributors
        7. Community Profile
        """
        async with httpx.AsyncClient() as client:
            # 1. Main repo metadata first to verify existence
            status, repo_meta, headers = await self._get(client, f"/repos/{owner}/{repo}")
            if status == 404 or not repo_meta:
                raise GitHubAPIError(
                    f"Repository '{owner}/{repo}' not found or is private.",
                    status_code=404
                )
            if status >= 400:
                raise GitHubAPIError(
                    f"Unable to access repository '{owner}/{repo}' (HTTP {status}).",
                    status_code=status
                )

            # Concurrent fetches for related endpoints
            commits_task = self._get(client, f"/repos/{owner}/{repo}/commits?per_page=100")
            stats_commit_task = self._get(client, f"/repos/{owner}/{repo}/stats/commit_activity")
            readme_task = self._get(client, f"/repos/{owner}/{repo}/readme")
            issues_task = self._get(client, f"/repos/{owner}/{repo}/issues?state=all&per_page=100")
            pulls_task = self._get(client, f"/repos/{owner}/{repo}/pulls?state=all&per_page=100")
            contributors_task = self._get(client, f"/repos/{owner}/{repo}/contributors?per_page=30")
            community_task = self._get(client, f"/repos/{owner}/{repo}/community/profile")

            results = await asyncio.gather(
                commits_task,
                stats_commit_task,
                readme_task,
                issues_task,
                pulls_task,
                contributors_task,
                community_task,
                return_exceptions=True
            )

            def extract_data(res):
                if isinstance(res, Exception):
                    return None
                status_code, data, _ = res
                return data if status_code == 200 else None

            commits_data = extract_data(results[0]) or []
            stats_commit_data = extract_data(results[1])
            readme_raw = extract_data(results[2])
            issues_raw = extract_data(results[3]) or []
            pulls_data = extract_data(results[4]) or []
            contributors_data = extract_data(results[5]) or []
            community_data = extract_data(results[6]) or {}

            # Process README text (base64 decode)
            readme_text = ""
            if readme_raw and isinstance(readme_raw, dict) and "content" in readme_raw:
                try:
                    readme_text = base64.b64decode(readme_raw["content"]).decode("utf-8", errors="replace")
                except Exception:
                    readme_text = ""

            return {
                "metadata": repo_meta,
                "commits": commits_data,
                "stats_commits": stats_commit_data,
                "readme_text": readme_text,
                "has_readme": bool(readme_text),
                "issues_raw": issues_raw,
                "pulls": pulls_data,
                "contributors": contributors_data,
                "community": community_data,
                "rate_limit_headers": {
                    "remaining": headers.get("x-ratelimit-remaining"),
                    "reset": headers.get("x-ratelimit-reset")
                }
            }

github_client = GitHubClient()
