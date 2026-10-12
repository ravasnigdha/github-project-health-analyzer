import time
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from ..schemas import (
    AnalyzeRequest, AnalyzeResponse, CompareRequest, CompareResponse,
    RateLimitResponse, HealthCheckResponse
)
from ..services.github_client import github_client, GitHubAPIError
from ..services.commit_analyzer import analyze_commits
from ..services.readme_analyzer import analyze_readme
from ..services.issue_analyzer import analyze_issues_and_prs
from ..services.contributor_analyzer import analyze_contributors
from ..services.repository_analyzer import analyze_repository_metadata
from ..services.health_scorer import calculate_health_score
from ..services.recommendations import generate_recommendations
from ..services.cache import analysis_cache
from ..config import settings

router = APIRouter()
START_TIME = time.time()

async def analyze_single_repo(url: str, force_refresh: bool = False) -> AnalyzeResponse:
    try:
        owner, repo = github_client.parse_repository_url(url)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    cache_key = f"{owner.lower()}/{repo.lower()}"
    if not force_refresh:
        cached_result = analysis_cache.get(cache_key)
        if cached_result:
            # Clone response and mark from_cache=True
            cached_result.from_cache = True
            return cached_result

    try:
        raw_data = await github_client.fetch_full_repo_data(owner, repo)
    except GitHubAPIError as ghe:
        raise HTTPException(
            status_code=ghe.status_code,
            detail={
                "message": ghe.message,
                "reset_time": ghe.reset_time
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error analyzing repository: {str(e)}"
        )

    # Run specialized analyzers
    commits = analyze_commits(raw_data["commits"], raw_data.get("stats_commits"))
    docs = analyze_readme(raw_data["readme_text"])
    meta = analyze_repository_metadata(raw_data["metadata"], raw_data.get("community"))
    issues = analyze_issues_and_prs(
        raw_data["issues_raw"],
        raw_data["pulls"],
        has_issues_enabled=meta.has_issues_enabled,
        meta_open_issues=meta.open_issues_count
    )
    contributors = analyze_contributors(raw_data["contributors"])

    # Score calculation & recommendations
    summary, categories, insights = calculate_health_score(meta, commits, docs, issues, contributors)
    recommendations = generate_recommendations(categories)

    response = AnalyzeResponse(
        metadata=meta,
        summary=summary,
        categories=categories,
        commits=commits,
        docs=docs,
        issues_prs=issues,
        contributors=contributors,
        recommendations=recommendations,
        insights=insights,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
        from_cache=False
    )

    # Save in TTL cache
    analysis_cache.set(cache_key, response)
    return response

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repository(req: AnalyzeRequest):
    """
    Analyzes a public GitHub repository and returns an explainable health score, metrics, and recommendations.
    """
    return await analyze_single_repo(req.repository_url)

@router.post("/compare", response_model=CompareResponse)
async def compare_repositories(req: CompareRequest):
    """
    Compares two public GitHub repositories side-by-side.
    """
    repo1_task = analyze_single_repo(req.repository_url_1)
    repo2_task = analyze_single_repo(req.repository_url_2)

    repo1, repo2 = await asyncio.gather(repo1_task, repo2_task)

    # Compute category score deltas
    deltas = {}
    r1_cats = {c.category_id: c.earned_points for c in repo1.categories}
    r2_cats = {c.category_id: c.earned_points for c in repo2.categories}

    for cat_id, r1_val in r1_cats.items():
        r2_val = r2_cats.get(cat_id, 0.0)
        deltas[cat_id] = round(r1_val - r2_val, 1)

    score_diff = repo1.summary.overall_score - repo2.summary.overall_score
    if score_diff > 0:
        summary_text = (
            f"{repo1.metadata.full_name} leads with an overall health score of {repo1.summary.overall_score}/100 "
            f"(+{score_diff} points vs {repo2.metadata.full_name} at {repo2.summary.overall_score}/100). "
            f"Note that repository age, domain scope, and team size influence these metrics."
        )
    elif score_diff < 0:
        summary_text = (
            f"{repo2.metadata.full_name} leads with an overall health score of {repo2.summary.overall_score}/100 "
            f"(+{abs(score_diff)} points vs {repo1.metadata.full_name} at {repo1.summary.overall_score}/100). "
            f"Note that repository age, domain scope, and team size influence these metrics."
        )
    else:
        summary_text = (
            f"Both repositories share an identical overall health score of {repo1.summary.overall_score}/100. "
            f"Review individual category breakdowns to understand specific differences in maintenance and documentation."
        )

    return CompareResponse(
        repo_1=repo1,
        repo_2=repo2,
        comparison_summary=summary_text,
        category_deltas=deltas
    )

@router.get("/rate-limit", response_model=RateLimitResponse)
async def get_github_rate_limit():
    """
    Returns current GitHub REST API rate limit and reset timestamp.
    """
    info = await github_client.get_rate_limit()
    reset_ts = info.get("reset_timestamp", 0)
    reset_utc = (
        datetime.fromtimestamp(reset_ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        if reset_ts else "Unknown"
    )
    return RateLimitResponse(
        limit=info.get("limit", 60),
        remaining=info.get("remaining", 0),
        reset_timestamp=reset_ts,
        reset_time_utc=reset_utc,
        is_authenticated=info.get("is_authenticated", False)
    )

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Operational status check of the backend service.
    """
    uptime = time.time() - START_TIME
    return HealthCheckResponse(
        status="healthy",
        uptime_seconds=round(uptime, 1),
        version=settings.APP_VERSION,
        cached_repos=analysis_cache.size()
    )

@router.post("/cache/clear")
async def clear_cache():
    """
    Flushes the in-memory analysis cache.
    """
    analysis_cache.clear()
    return {"message": "In-memory cache flushed successfully.", "cached_repos": 0}
