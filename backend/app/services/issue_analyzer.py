from typing import List, Dict, Any, Optional
from ..schemas import IssuePRMetrics

def analyze_issues_and_prs(
    issues_raw: List[Dict[str, Any]], 
    pulls_raw: List[Dict[str, Any]], 
    has_issues_enabled: bool = True,
    meta_open_issues: int = 0
) -> IssuePRMetrics:
    """
    Separates GitHub issues from Pull Requests and computes management metrics.
    """
    if not has_issues_enabled:
        # Repositories with issues disabled
        return IssuePRMetrics(
            open_issues_count=0,
            closed_issues_count=0,
            open_prs_count=len([p for p in pulls_raw if p.get("state") == "open"]),
            closed_prs_count=len([p for p in pulls_raw if p.get("state") == "closed"]),
            merged_prs_count=len([p for p in pulls_raw if p.get("merged_at") is not None]),
            pr_to_issue_ratio=None,
            issue_closure_rate=None,
            issues_enabled=False
        )

    # Filter out PRs from the issues endpoint (GitHub returns PRs in /issues)
    pure_issues = [item for item in issues_raw if "pull_request" not in item]

    open_issues = len([i for i in pure_issues if i.get("state") == "open"])
    closed_issues = len([i for i in pure_issues if i.get("state") == "closed"])

    # Fallback to repo metadata for total open issues if sampled list has fewer
    if meta_open_issues > open_issues:
        open_issues = meta_open_issues

    open_prs = len([p for p in pulls_raw if p.get("state") == "open"])
    closed_prs = len([p for p in pulls_raw if p.get("state") == "closed"])
    merged_prs = len([p for p in pulls_raw if p.get("merged_at") is not None])

    # Ratios
    total_issues = open_issues + closed_issues
    closure_rate = (closed_issues / total_issues) if total_issues > 0 else None
    pr_ratio = (open_prs / open_issues) if open_issues > 0 else None

    return IssuePRMetrics(
        open_issues_count=open_issues,
        closed_issues_count=closed_issues,
        open_prs_count=open_prs,
        closed_prs_count=closed_prs,
        merged_prs_count=merged_prs,
        pr_to_issue_ratio=round(pr_ratio, 2) if pr_ratio is not None else None,
        issue_closure_rate=round(closure_rate, 2) if closure_rate is not None else None,
        issues_enabled=True
    )
