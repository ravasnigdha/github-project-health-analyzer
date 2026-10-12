from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from ..schemas import CommitMetrics, CommitTimelinePoint

def analyze_commits(commits_data: List[Dict[str, Any]], stats_commit_data: Optional[List[Dict[str, Any]]] = None) -> CommitMetrics:
    """
    Analyzes commit activity, recency, cadence, and produces timeline buckets.
    """
    if not commits_data:
        # Build empty 30-day timeline
        now = datetime.now(timezone.utc)
        empty_30d = [
            CommitTimelinePoint(
                date=(now - timedelta(days=i)).strftime("%Y-%m-%d"),
                count=0,
                label=(now - timedelta(days=i)).strftime("%b %d")
            )
            for i in reversed(range(30))
        ]
        return CommitMetrics(
            total_sampled=0,
            days_since_last_commit=None,
            last_commit_date=None,
            commits_last_30_days=0,
            commits_last_90_days=0,
            timeline_30d=empty_30d,
            timeline_90d=[],
            timeline_180d=[]
        )

    now = datetime.now(timezone.utc)
    commit_dates: List[datetime] = []

    for c in commits_data:
        commit_obj = c.get("commit", {})
        committer = commit_obj.get("committer", {}) or commit_obj.get("author", {})
        date_str = committer.get("date")
        if date_str:
            try:
                # Handle ISO 8601 with Z or offset
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                commit_dates.append(dt)
            except Exception:
                pass

    commit_dates.sort(reverse=True)
    last_commit_date = commit_dates[0] if commit_dates else None
    days_since_last = (now - last_commit_date).days if last_commit_date else None

    # Count commits in last 30 and 90 days
    c_30 = sum(1 for d in commit_dates if (now - d).days <= 30)
    c_90 = sum(1 for d in commit_dates if (now - d).days <= 90)

    # Generate daily buckets for 30-day timeline
    date_counts_30: Dict[str, int] = {}
    for i in range(30):
        d_str = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        date_counts_30[d_str] = 0

    for d in commit_dates:
        if (now - d).days < 30:
            d_str = d.strftime("%Y-%m-%d")
            if d_str in date_counts_30:
                date_counts_30[d_str] += 1

    timeline_30d = [
        CommitTimelinePoint(
            date=d_str,
            count=count,
            label=datetime.strptime(d_str, "%Y-%m-%d").strftime("%b %d")
        )
        for d_str, count in sorted(date_counts_30.items())
    ]

    # Generate weekly buckets for 90 days (13 weeks)
    date_counts_90: Dict[str, int] = {}
    for i in range(0, 90, 7):
        w_start = (now - timedelta(days=i+6)).strftime("%Y-%m-%d")
        date_counts_90[w_start] = 0

    for d in commit_dates:
        days_ago = (now - d).days
        if days_ago < 90:
            bucket_idx = (days_ago // 7) * 7
            w_start = (now - timedelta(days=bucket_idx+6)).strftime("%Y-%m-%d")
            if w_start in date_counts_90:
                date_counts_90[w_start] += 1

    timeline_90d = [
        CommitTimelinePoint(
            date=w_str,
            count=count,
            label=f"Wk of {datetime.strptime(w_str, '%Y-%m-%d').strftime('%b %d')}"
        )
        for w_str, count in sorted(date_counts_90.items())
    ]

    # Generate bi-weekly buckets for 180 days (approx 26 weeks)
    date_counts_180: Dict[str, int] = {}
    for i in range(0, 180, 14):
        p_start = (now - timedelta(days=i+13)).strftime("%Y-%m-%d")
        date_counts_180[p_start] = 0

    for d in commit_dates:
        days_ago = (now - d).days
        if days_ago < 180:
            bucket_idx = (days_ago // 14) * 14
            p_start = (now - timedelta(days=bucket_idx+13)).strftime("%Y-%m-%d")
            if p_start in date_counts_180:
                date_counts_180[p_start] += 1

    timeline_180d = [
        CommitTimelinePoint(
            date=p_str,
            count=count,
            label=datetime.strptime(p_str, "%Y-%m-%d").strftime("%b %d")
        )
        for p_str, count in sorted(date_counts_180.items())
    ]

    return CommitMetrics(
        total_sampled=len(commits_data),
        days_since_last_commit=days_since_last,
        last_commit_date=last_commit_date.isoformat() if last_commit_date else None,
        commits_last_30_days=c_30,
        commits_last_90_days=c_90,
        timeline_30d=timeline_30d,
        timeline_90d=timeline_90d,
        timeline_180d=timeline_180d
    )
