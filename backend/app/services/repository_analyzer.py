from typing import Dict, Any, Optional
from ..schemas import RepositoryMetadata

def analyze_repository_metadata(repo_meta: Dict[str, Any], community_profile: Optional[Dict[str, Any]] = None) -> RepositoryMetadata:
    """
    Parses and structures repository metadata and community files.
    """
    owner_info = repo_meta.get("owner", {})
    owner = owner_info.get("login", "unknown")
    repo = repo_meta.get("name", "unknown")

    license_info = repo_meta.get("license") or {}
    license_name = license_info.get("name") if isinstance(license_info, dict) else None
    license_spdx = license_info.get("spdx_id") if isinstance(license_info, dict) else None

    # Community health files
    files = (community_profile.get("files", {}) if community_profile else {}) or {}
    has_contributing = bool(files.get("contributing"))
    has_coc = bool(files.get("code_of_conduct"))
    has_issue_templates = bool(files.get("issue_template"))

    return RepositoryMetadata(
        owner=owner,
        repo=repo,
        full_name=repo_meta.get("full_name", f"{owner}/{repo}"),
        html_url=repo_meta.get("html_url", f"https://github.com/{owner}/{repo}"),
        description=repo_meta.get("description"),
        language=repo_meta.get("language"),
        stars_count=repo_meta.get("stargazers_count", 0),
        forks_count=repo_meta.get("forks_count", 0),
        open_issues_count=repo_meta.get("open_issues_count", 0),
        watchers_count=repo_meta.get("watchers_count", 0),
        license_name=license_name,
        license_spdx=license_spdx,
        default_branch=repo_meta.get("default_branch", "main"),
        created_at=repo_meta.get("created_at", ""),
        updated_at=repo_meta.get("updated_at", ""),
        pushed_at=repo_meta.get("pushed_at", ""),
        is_archived=repo_meta.get("archived", False),
        topics=repo_meta.get("topics", []),
        has_issues_enabled=repo_meta.get("has_issues", True),
        has_wiki_enabled=repo_meta.get("has_wiki", False),
        has_contributing_file=has_contributing,
        has_code_of_conduct=has_coc,
        has_issue_templates=has_issue_templates
    )
