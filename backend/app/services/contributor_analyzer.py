from typing import List, Dict, Any
from ..schemas import ContributorMetrics, ContributorInfo

def analyze_contributors(contributors_raw: List[Dict[str, Any]]) -> ContributorMetrics:
    """
    Evaluates community activity, top contributor share, and collaboration health.
    """
    if not contributors_raw:
        return ContributorMetrics(
            total_contributors=0,
            top_contributor_share_percent=0.0,
            bus_factor_risk="low",
            top_contributors=[]
        )

    total_contributors = len(contributors_raw)
    total_commits = sum(c.get("contributions", 0) for c in contributors_raw)

    top_contributors: List[ContributorInfo] = []
    top_share = 0.0

    for idx, c in enumerate(contributors_raw[:10]):  # Top 10
        conts = c.get("contributions", 0)
        share = (conts / total_commits * 100) if total_commits > 0 else 0.0
        if idx == 0:
            top_share = share
        top_contributors.append(ContributorInfo(
            login=c.get("login", "unknown"),
            avatar_url=c.get("avatar_url"),
            contributions=conts,
            share_percent=round(share, 1)
        ))

    # Evaluate bus factor risk with nuance:
    # A 1-person personal repo has 100% share but is not necessarily a defective open-source ecosystem
    if total_contributors == 1:
        bus_risk = "moderate"
    elif top_share > 85.0 and total_contributors >= 3:
        bus_risk = "high"
    elif top_share > 60.0:
        bus_risk = "moderate"
    else:
        bus_risk = "low"

    return ContributorMetrics(
        total_contributors=total_contributors,
        top_contributor_share_percent=round(top_share, 1),
        bus_factor_risk=bus_risk,
        top_contributors=top_contributors
    )
