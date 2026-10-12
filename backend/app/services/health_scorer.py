from typing import List, Tuple, Dict, Any
from ..schemas import (
    CheckResult, CategoryScore, HealthSummary,
    RepositoryMetadata, CommitMetrics, DocumentationMetrics,
    IssuePRMetrics, ContributorMetrics
)
from ..config import settings

def calculate_health_score(
    meta: RepositoryMetadata,
    commits: CommitMetrics,
    docs: DocumentationMetrics,
    issues: IssuePRMetrics,
    contributors: ContributorMetrics
) -> Tuple[HealthSummary, List[CategoryScore], List[str]]:
    """
    Deterministic, transparent, rule-based 5-category scoring engine (100 total points).
    """
    categories: List[CategoryScore] = []
    insights: List[str] = []

    # =========================================================================
    # 1. Maintenance and Commit Activity (25 pts)
    # =========================================================================
    cat1_checks: List[CheckResult] = []

    # Check 1.1: Commit Recency (10 pts)
    if meta.is_archived:
        c1_pts = 0.0
        c1_status = "failed"
        c1_exp = "The repository is archived on GitHub and no longer actively maintained."
        c1_ev = "Repository is marked as archived."
        insights.append("Repository is archived and read-only.")
    elif commits.days_since_last_commit is None:
        c1_pts = 0.0
        c1_status = "failed"
        c1_exp = "No commit history was observed in the default branch."
        c1_ev = "0 commits found."
        insights.append("No commit history was observed.")
    elif commits.days_since_last_commit <= 14:
        c1_pts = 10.0
        c1_status = "passed"
        c1_exp = "Recent commit activity observed within the past two weeks."
        c1_ev = f"Last commit {commits.days_since_last_commit} days ago."
        insights.append(f"Recent commit activity ({commits.days_since_last_commit} days ago).")
    elif commits.days_since_last_commit <= 30:
        c1_pts = 8.0
        c1_status = "passed"
        c1_exp = "Recent commit activity within the past month."
        c1_ev = f"Last commit {commits.days_since_last_commit} days ago."
    elif commits.days_since_last_commit <= 90:
        c1_pts = 5.0
        c1_status = "warning"
        c1_exp = "Moderate commit recency; last commit was 1 to 3 months ago."
        c1_ev = f"Last commit {commits.days_since_last_commit} days ago."
    elif commits.days_since_last_commit <= 180:
        c1_pts = 2.0
        c1_status = "warning"
        c1_exp = "Low recent activity; last commit was between 3 and 6 months ago."
        c1_ev = f"Last commit {commits.days_since_last_commit} days ago."
    else:
        c1_pts = 0.0
        c1_status = "failed"
        c1_exp = "Inactive; no commits observed in over 6 months."
        c1_ev = f"Last commit {commits.days_since_last_commit} days ago."
        insights.append(f"No commits in over 6 months ({commits.days_since_last_commit} days ago).")

    cat1_checks.append(CheckResult(
        id="maint_recency",
        title="Commit Recency",
        category="Maintenance & Activity",
        earned_points=c1_pts,
        max_points=10.0,
        status=c1_status,
        explanation=c1_exp,
        evidence=c1_ev
    ))

    # Check 1.2: 90-Day Cadence (8 pts)
    c90 = commits.commits_last_90_days
    if meta.is_archived:
        c2_pts = 0.0
        c2_status = "failed"
        c2_exp = "Archived repository with zero active development."
        c2_ev = "Archived."
    elif c90 >= 30:
        c2_pts = 8.0
        c2_status = "passed"
        c2_exp = "High commit velocity over the past 90 days."
        c2_ev = f"{c90} commits in last 90 days."
        insights.append(f"High development velocity: {c90} commits over the last 90 days.")
    elif c90 >= 10:
        c2_pts = 6.0
        c2_status = "passed"
        c2_exp = "Steady commit activity over the past 90 days."
        c2_ev = f"{c90} commits in last 90 days."
    elif c90 >= 3:
        c2_pts = 4.0
        c2_status = "warning"
        c2_exp = "Low commit activity over the past 90 days."
        c2_ev = f"{c90} commits in last 90 days."
    elif c90 >= 1:
        c2_pts = 2.0
        c2_status = "warning"
        c2_exp = "Minimal commit activity in the past quarter."
        c2_ev = f"{c90} commits in last 90 days."
    else:
        c2_pts = 0.0
        c2_status = "failed"
        c2_exp = "Zero commits observed in the past 90 days."
        c2_ev = "0 commits in 90 days."

    cat1_checks.append(CheckResult(
        id="maint_cadence_90d",
        title="90-Day Commit Cadence",
        category="Maintenance & Activity",
        earned_points=c2_pts,
        max_points=8.0,
        status=c2_status,
        explanation=c2_exp,
        evidence=c2_ev
    ))

    # Check 1.3: Active Maintenance Posture (7 pts)
    c30 = commits.commits_last_30_days
    if meta.is_archived:
        c3_pts = 0.0
        c3_status = "failed"
        c3_exp = "Repository is archived."
        c3_ev = "Archived status."
    elif c30 >= 5:
        c3_pts = 7.0
        c3_status = "passed"
        c3_exp = "Consistently active development within the current month."
        c3_ev = f"{c30} commits in last 30 days."
    elif c30 >= 1:
        c3_pts = 5.0
        c3_status = "passed"
        c3_exp = "Active commits logged in the current month."
        c3_ev = f"{c30} commits in last 30 days."
    elif commits.days_since_last_commit is not None and commits.days_since_last_commit <= 60:
        c3_pts = 3.0
        c3_status = "warning"
        c3_exp = "Quiet current month, but recent commits within 60 days."
        c3_ev = f"0 commits in last 30d; {commits.days_since_last_commit}d since last commit."
    else:
        c3_pts = 0.0
        c3_status = "failed"
        c3_exp = "No activity in the last 30 days."
        c3_ev = "0 commits in last 30 days."

    cat1_checks.append(CheckResult(
        id="maint_consistency",
        title="30-Day Activity Consistency",
        category="Maintenance & Activity",
        earned_points=c3_pts,
        max_points=7.0,
        status=c3_status,
        explanation=c3_exp,
        evidence=c3_ev
    ))

    earned_cat1 = sum(c.earned_points for c in cat1_checks)
    categories.append(CategoryScore(
        category_id="maintenance",
        title="Maintenance & Activity",
        weight=25.0,
        earned_points=round(earned_cat1, 1),
        max_points=25.0,
        percentage=round((earned_cat1 / 25.0) * 100, 1),
        status="strong" if earned_cat1 >= 20 else ("moderate" if earned_cat1 >= 13 else "weak"),
        interpretation=(
            "Actively maintained with consistent updates." if earned_cat1 >= 20
            else ("Moderate maintenance with occasional commits." if earned_cat1 >= 13
                  else "Infrequently maintained or dormant.")) ,
        checks=cat1_checks
    ))

    # =========================================================================
    # 2. Documentation (20 pts)
    # =========================================================================
    cat2_checks: List[CheckResult] = []

    # Check 2.1: README existence & substance (7 pts)
    if not docs.has_readme:
        d1_pts = 0.0
        d1_status = "failed"
        d1_exp = "No README file found in the root directory."
        d1_ev = "README missing."
        insights.append("Missing README file.")
    elif docs.word_count >= 300:
        d1_pts = 7.0
        d1_status = "passed"
        d1_exp = "Comprehensive README with substantive documentation."
        d1_ev = f"README present ({docs.word_count} words)."
        insights.append(f"Detailed README documentation ({docs.word_count} words).")
    elif docs.word_count >= 100:
        d1_pts = 5.0
        d1_status = "passed"
        d1_exp = "Standard README present with basic introductory content."
        d1_ev = f"README present ({docs.word_count} words)."
    else:
        d1_pts = 2.0
        d1_status = "warning"
        d1_exp = "Minimal README with very brief content."
        d1_ev = f"README present ({docs.word_count} words)."

    cat2_checks.append(CheckResult(
        id="doc_readme",
        title="README & Substance",
        category="Documentation",
        earned_points=d1_pts,
        max_points=7.0,
        status=d1_status,
        explanation=d1_exp,
        evidence=d1_ev
    ))

    # Check 2.2: Installation Instructions (5 pts)
    if docs.has_installation:
        d2_pts = 5.0
        d2_status = "passed"
        d2_exp = "Recognizable installation or setup section detected."
        d2_ev = "Detected installation header in README."
        insights.append("Installation instructions detected in README.")
    else:
        d2_pts = 0.0
        d2_status = "failed"
        d2_exp = "No clear Installation or Getting Started heading detected in README."
        d2_ev = "No installation heading found."

    cat2_checks.append(CheckResult(
        id="doc_installation",
        title="Installation Instructions",
        category="Documentation",
        earned_points=d2_pts,
        max_points=5.0,
        status=d2_status,
        explanation=d2_exp,
        evidence=d2_ev
    ))

    # Check 2.3: Usage Examples & Code Blocks (4 pts)
    if docs.has_usage and docs.has_code_examples:
        d3_pts = 4.0
        d3_status = "passed"
        d3_exp = "Usage instructions and code examples provided."
        d3_ev = "Usage header and fenced code blocks detected."
    elif docs.has_usage or docs.has_code_examples:
        d3_pts = 2.5
        d3_status = "warning"
        d3_exp = "Partial usage guidance (either code snippets or usage heading found)."
        d3_ev = f"Usage section: {docs.has_usage}, Code blocks: {docs.has_code_examples}."
    else:
        d3_pts = 0.0
        d3_status = "failed"
        d3_exp = "No usage instructions or code examples detected."
        d3_ev = "No usage header or code blocks found."

    cat2_checks.append(CheckResult(
        id="doc_usage",
        title="Usage Guidance & Code Blocks",
        category="Documentation",
        earned_points=d3_pts,
        max_points=4.0,
        status=d3_status,
        explanation=d3_exp,
        evidence=d3_ev
    ))

    # Check 2.4: Contribution Guidance (4 pts)
    if docs.has_contributing or meta.has_contributing_file:
        d4_pts = 4.0
        d4_status = "passed"
        d4_exp = "Clear contributing instructions found in README or CONTRIBUTING.md."
        d4_ev = "Contributing section or file detected."
        insights.append("Contributing guidelines available for new contributors.")
    else:
        d4_pts = 0.0
        d4_status = "failed"
        d4_exp = "No contributing guidance found for community participation."
        d4_ev = "Neither CONTRIBUTING.md nor Contributing section detected."

    cat2_checks.append(CheckResult(
        id="doc_contributing",
        title="Contributing Guidance",
        category="Documentation",
        earned_points=d4_pts,
        max_points=4.0,
        status=d4_status,
        explanation=d4_exp,
        evidence=d4_ev
    ))

    earned_cat2 = sum(c.earned_points for c in cat2_checks)
    categories.append(CategoryScore(
        category_id="documentation",
        title="Documentation",
        weight=20.0,
        earned_points=round(earned_cat2, 1),
        max_points=20.0,
        percentage=round((earned_cat2 / 20.0) * 100, 1),
        status="strong" if earned_cat2 >= 16 else ("moderate" if earned_cat2 >= 10 else "weak"),
        interpretation=(
            "Well documented with clear instructions and examples." if earned_cat2 >= 16
            else ("Basic documentation provided, but key sections could be expanded." if earned_cat2 >= 10
                  else "Documentation is missing or very sparse.")) ,
        checks=cat2_checks
    ))

    # =========================================================================
    # 3. Issues and Pull Requests (20 pts)
    # =========================================================================
    cat3_checks: List[CheckResult] = []
    cat3_is_available = issues.issues_enabled

    if not cat3_is_available:
        # Repositories with issues disabled
        cat3_checks.append(CheckResult(
            id="issue_management",
            title="Issue Tracking",
            category="Issues & Pull Requests",
            earned_points=0.0,
            max_points=20.0,
            status="unavailable",
            explanation="Issues are disabled for this repository by the maintainer.",
            evidence="GitHub issues feature disabled."
        ))
        earned_cat3 = 0.0
        cat3_status = "unavailable"
        cat3_interp = "Issues are disabled on this repository."
    else:
        # Check 3.1: Issue Closure & Responsiveness (8 pts)
        tot_issues = issues.open_issues_count + issues.closed_issues_count
        if tot_issues == 0:
            i1_pts = 8.0
            i1_status = "passed"
            i1_exp = "No open or closed issues logged (clean issue backlog)."
            i1_ev = "0 issues reported."
        elif issues.issue_closure_rate is not None and issues.issue_closure_rate >= 0.65:
            i1_pts = 8.0
            i1_status = "passed"
            i1_exp = f"Healthy resolution rate ({int(issues.issue_closure_rate * 100)}% of issues closed)."
            i1_ev = f"{issues.closed_issues_count} closed out of {tot_issues} total issues."
            insights.append(f"Strong issue resolution rate: {int(issues.issue_closure_rate * 100)}% resolved.")
        elif issues.issue_closure_rate is not None and issues.issue_closure_rate >= 0.40:
            i1_pts = 6.0
            i1_status = "passed"
            i1_exp = f"Moderate resolution rate ({int(issues.issue_closure_rate * 100)}% closed)."
            i1_ev = f"{issues.closed_issues_count} closed out of {tot_issues} total issues."
        elif issues.issue_closure_rate is not None and issues.issue_closure_rate >= 0.15:
            i1_pts = 4.0
            i1_status = "warning"
            i1_exp = f"Lower resolution rate ({int(issues.issue_closure_rate * 100)}% closed)."
            i1_ev = f"{issues.closed_issues_count} closed out of {tot_issues} total issues."
        else:
            i1_pts = 2.0
            i1_status = "warning"
            i1_exp = "Low closure rate indicating potential issue backlog buildup."
            i1_ev = f"{issues.closed_issues_count} closed out of {tot_issues} total issues."

        cat3_checks.append(CheckResult(
            id="issue_resolution",
            title="Issue Resolution Rate",
            category="Issues & Pull Requests",
            earned_points=i1_pts,
            max_points=8.0,
            status=i1_status,
            explanation=i1_exp,
            evidence=i1_ev
        ))

        # Check 3.2: Pull Request Activity (8 pts)
        if issues.merged_prs_count > 0 or issues.closed_prs_count > 0:
            i2_pts = 8.0
            i2_status = "passed"
            i2_exp = "Active pull request review and merge workflow observed."
            i2_ev = f"{issues.merged_prs_count} merged PRs, {issues.closed_prs_count} closed PRs."
            insights.append("Active pull request workflow with merged contributions.")
        elif issues.open_prs_count > 0:
            i2_pts = 4.0
            i2_status = "warning"
            i2_exp = "Open PRs exist without merged or closed records in sample."
            i2_ev = f"{issues.open_prs_count} open PRs."
        else:
            # Small repo without PR workflow yet
            i2_pts = 6.0
            i2_status = "passed"
            i2_exp = "No pending PR backlog."
            i2_ev = "0 pending pull requests."

        cat3_checks.append(CheckResult(
            id="pr_workflow",
            title="Pull Request Workflow",
            category="Issues & Pull Requests",
            earned_points=i2_pts,
            max_points=8.0,
            status=i2_status,
            explanation=i2_exp,
            evidence=i2_ev
        ))

        # Check 3.3: Backlog Manageability (4 pts)
        open_c = issues.open_issues_count
        if open_c <= 25:
            i3_pts = 4.0
            i3_status = "passed"
            i3_exp = "Manageable open issue volume."
            i3_ev = f"{open_c} open issues."
        elif open_c <= 100:
            i3_pts = 3.0
            i3_status = "passed"
            i3_exp = "Moderate open issue count."
            i3_ev = f"{open_c} open issues."
        elif open_c <= 300:
            i3_pts = 2.0
            i3_status = "warning"
            i3_exp = "Substantial open issue count requiring triage."
            i3_ev = f"{open_c} open issues."
        else:
            i3_pts = 1.0
            i3_status = "warning"
            i3_exp = "Large backlog of open issues."
            i3_ev = f"{open_c} open issues."

        cat3_checks.append(CheckResult(
            id="issue_backlog",
            title="Issue Backlog Manageability",
            category="Issues & Pull Requests",
            earned_points=i3_pts,
            max_points=4.0,
            status=i3_status,
            explanation=i3_exp,
            evidence=i3_ev
        ))

        earned_cat3 = sum(c.earned_points for c in cat3_checks)
        cat3_status = "strong" if earned_cat3 >= 16 else ("moderate" if earned_cat3 >= 10 else "weak")
        cat3_interp = (
            "Healthy issue triage and pull request integration." if earned_cat3 >= 16
            else ("Moderate issue management with potential backlog." if earned_cat3 >= 10
                  else "Issue queue requires attention."))

    categories.append(CategoryScore(
        category_id="issues_prs",
        title="Issues & Pull Requests",
        weight=20.0,
        earned_points=round(earned_cat3, 1),
        max_points=20.0,
        percentage=round((earned_cat3 / 20.0) * 100, 1) if cat3_is_available else 0.0,
        status=cat3_status,
        interpretation=cat3_interp,
        checks=cat3_checks
    ))

    # =========================================================================
    # 4. Contributor Activity (15 pts)
    # =========================================================================
    cat4_checks: List[CheckResult] = []

    # Check 4.1: Contributor Diversity (8 pts)
    n_conts = contributors.total_contributors
    if n_conts >= 10:
        con1_pts = 8.0
        con1_status = "passed"
        con1_exp = "Broad contributor base with strong community engagement."
        con1_ev = f"{n_conts} contributors observed."
        insights.append(f"Vibrant contributor base ({n_conts}+ contributors).")
    elif n_conts >= 4:
        con1_pts = 6.0
        con1_status = "passed"
        con1_exp = "Multi-person contributor team."
        con1_ev = f"{n_conts} contributors observed."
    elif n_conts >= 2:
        con1_pts = 4.5
        con1_status = "passed"
        con1_exp = "Collaborative small team with multiple contributors."
        con1_ev = f"{n_conts} contributors observed."
    elif n_conts == 1:
        con1_pts = 3.0
        con1_status = "warning"
        con1_exp = "Single primary maintainer project."
        con1_ev = "1 contributor observed."
    else:
        con1_pts = 1.0
        con1_status = "warning"
        con1_exp = "No public contributor list available."
        con1_ev = "0 contributors listed."

    cat4_checks.append(CheckResult(
        id="contrib_diversity",
        title="Contributor Diversity",
        category="Contributor Activity",
        earned_points=con1_pts,
        max_points=8.0,
        status=con1_status,
        explanation=con1_exp,
        evidence=con1_ev
    ))

    # Check 4.2: Work Distribution & Bus Factor (4 pts)
    if contributors.bus_factor_risk == "low":
        con2_pts = 4.0
        con2_status = "passed"
        con2_exp = "Healthy work distribution; commit volume shared across contributors."
        con2_ev = f"Top contributor share: {contributors.top_contributor_share_percent}%."
    elif contributors.bus_factor_risk == "moderate":
        con2_pts = 3.0
        con2_status = "warning"
        con2_exp = "Moderate commit concentration in primary maintainer."
        con2_ev = f"Top contributor share: {contributors.top_contributor_share_percent}%."
    else:
        con2_pts = 1.5
        con2_status = "warning"
        con2_exp = "High concentration of commits in a single contributor."
        con2_ev = f"Top contributor accounts for {contributors.top_contributor_share_percent}% of commits."
        insights.append(f"High commit concentration ({contributors.top_contributor_share_percent}% by top author).")

    cat4_checks.append(CheckResult(
        id="contrib_bus_factor",
        title="Work Distribution & Bus Factor",
        category="Contributor Activity",
        earned_points=con2_pts,
        max_points=4.0,
        status=con2_status,
        explanation=con2_exp,
        evidence=con2_ev
    ))

    # Check 4.3: Recent Collaboration (3 pts)
    if commits.commits_last_90_days > 0 and n_conts > 0:
        con3_pts = 3.0
        con3_status = "passed"
        con3_exp = "Active commits logged by contributors within recent months."
        con3_ev = f"{commits.commits_last_90_days} commits in 90 days."
    else:
        con3_pts = 1.0
        con3_status = "warning"
        con3_exp = "Limited recent collaborative activity."
        con3_ev = "Low recent commit frequency."

    cat4_checks.append(CheckResult(
        id="contrib_engagement",
        title="Recent Community Engagement",
        category="Contributor Activity",
        earned_points=con3_pts,
        max_points=3.0,
        status=con3_status,
        explanation=con3_exp,
        evidence=con3_ev
    ))

    earned_cat4 = sum(c.earned_points for c in cat4_checks)
    categories.append(CategoryScore(
        category_id="contributors",
        title="Contributor Activity",
        weight=15.0,
        earned_points=round(earned_cat4, 1),
        max_points=15.0,
        percentage=round((earned_cat4 / 15.0) * 100, 1),
        status="strong" if earned_cat4 >= 12 else ("moderate" if earned_cat4 >= 8 else "weak"),
        interpretation=(
            "Broad and active contributor involvement." if earned_cat4 >= 12
            else ("Small team or single maintainer with steady output." if earned_cat4 >= 8
                  else "Low community collaboration observed.")) ,
        checks=cat4_checks
    ))

    # =========================================================================
    # 5. Repository Organization (20 pts)
    # =========================================================================
    cat5_checks: List[CheckResult] = []

    # Check 5.1: Open Source License (6 pts)
    if meta.license_name:
        org1_pts = 6.0
        org1_status = "passed"
        org1_exp = f"Recognized open source license: {meta.license_name}."
        org1_ev = f"SPDX: {meta.license_spdx or meta.license_name}."
        insights.append(f"Licensed under {meta.license_name}.")
    else:
        org1_pts = 0.0
        org1_status = "failed"
        org1_exp = "No recognized license file or metadata found."
        org1_ev = "No license specified."
        insights.append("No open-source license detected.")

    cat5_checks.append(CheckResult(
        id="org_license",
        title="Open Source License",
        category="Repository Organization",
        earned_points=org1_pts,
        max_points=6.0,
        status=org1_status,
        explanation=org1_exp,
        evidence=org1_ev
    ))

    # Check 5.2: Description & Topics (4 pts)
    has_desc = bool(meta.description and meta.description.strip())
    has_topics = len(meta.topics) >= 2
    if has_desc and has_topics:
        org2_pts = 4.0
        org2_status = "passed"
        org2_exp = "Clear description and discoverability tags/topics provided."
        org2_ev = f"Topics: {', '.join(meta.topics[:4])}."
        insights.append("Project description and search topics configured.")
    elif has_desc or has_topics:
        org2_pts = 2.5
        org2_status = "warning"
        org2_exp = "Partial discoverability metadata (has description or tags)."
        org2_ev = f"Description: {has_desc}, Topics: {len(meta.topics)}."
    else:
        org2_pts = 0.0
        org2_status = "failed"
        org2_exp = "Missing repository description and discoverability topics."
        org2_ev = "No description or topics provided."

    cat5_checks.append(CheckResult(
        id="org_metadata",
        title="Description & Discoverability",
        category="Repository Organization",
        earned_points=org2_pts,
        max_points=4.0,
        status=org2_status,
        explanation=org2_exp,
        evidence=org2_ev
    ))

    # Check 5.3: Community Governance Files (6 pts)
    gov_count = sum([
        1 if meta.has_code_of_conduct else 0,
        1 if (meta.has_contributing_file or docs.has_contributing) else 0,
        1 if meta.has_issue_templates else 0
    ])
    if gov_count == 3:
        org3_pts = 6.0
        org3_status = "passed"
        org3_exp = "Comprehensive governance: Code of Conduct, Contributing guidelines, and issue templates."
        org3_ev = "All standard community templates found."
        insights.append("Comprehensive community governance files present.")
    elif gov_count == 2:
        org3_pts = 4.5
        org3_status = "passed"
        org3_exp = "Good governance files (2 out of 3 standard templates present)."
        org3_ev = f"{gov_count} governance templates found."
    elif gov_count == 1:
        org3_pts = 3.0
        org3_status = "warning"
        org3_exp = "Basic governance (1 template present)."
        org3_ev = f"{gov_count} template found."
    else:
        org3_pts = 1.0
        org3_status = "warning"
        org3_exp = "Lacks standard community templates (Code of Conduct, issue templates)."
        org3_ev = "No community templates detected."

    cat5_checks.append(CheckResult(
        id="org_governance",
        title="Community Governance Files",
        category="Repository Organization",
        earned_points=org3_pts,
        max_points=6.0,
        status=org3_status,
        explanation=org3_exp,
        evidence=org3_ev
    ))

    # Check 5.4: Repository Hygiene & Active State (4 pts)
    if not meta.is_archived and meta.default_branch:
        org4_pts = 4.0
        org4_status = "passed"
        org4_exp = f"Active default branch '{meta.default_branch}' and healthy repository posture."
        org4_ev = f"Default branch: {meta.default_branch}."
    else:
        org4_pts = 0.0
        org4_status = "failed"
        org4_exp = "Repository is archived or lacks a standard active branch."
        org4_ev = "Archived state."

    cat5_checks.append(CheckResult(
        id="org_hygiene",
        title="Repository Hygiene & Active Status",
        category="Repository Organization",
        earned_points=org4_pts,
        max_points=4.0,
        status=org4_status,
        explanation=org4_exp,
        evidence=org4_ev
    ))

    earned_cat5 = sum(c.earned_points for c in cat5_checks)
    categories.append(CategoryScore(
        category_id="organization",
        title="Repository Organization",
        weight=20.0,
        earned_points=round(earned_cat5, 1),
        max_points=20.0,
        percentage=round((earned_cat5 / 20.0) * 100, 1),
        status="strong" if earned_cat5 >= 16 else ("moderate" if earned_cat5 >= 10 else "weak"),
        interpretation=(
            "Well organized with clear license and project structure." if earned_cat5 >= 16
            else ("Adequately organized, but missing some community health files." if earned_cat5 >= 10
                  else "Missing essential governance files and license.")) ,
        checks=cat5_checks
    ))

    # =========================================================================
    # Total Score & Fairness Calculation
    # =========================================================================
    available_max = sum(cat.max_points for cat in categories if cat.status != "unavailable")
    available_earned = sum(cat.earned_points for cat in categories if cat.status != "unavailable")

    is_provisional = available_max < 100.0
    coverage_pct = round((available_max / 100.0) * 100.0, 1)

    if is_provisional and available_max > 0:
        # Normalize to 100-point scale
        overall_score = int(round((available_earned / available_max) * 100.0))
    else:
        overall_score = int(round(available_earned))

    # Clamp 0-100
    overall_score = max(0, min(100, overall_score))

    # Status interpretation
    if overall_score >= 85:
        status_label = "Strong indicators"
        status_tone = "positive"
        short_exp = "The repository displays strong signals of active maintenance, clear documentation, and sound organization."
    elif overall_score >= 70:
        status_label = "Generally healthy indicators"
        status_tone = "positive"
        short_exp = "The repository demonstrates generally healthy maintenance with some opportunities for enhancement."
    elif overall_score >= 50:
        status_label = "Needs attention"
        status_tone = "warning"
        short_exp = "Observable indicators suggest maintenance gaps, missing documentation, or reduced commit cadence."
    else:
        status_label = "Significant concerns"
        status_tone = "critical"
        short_exp = "The repository exhibits low recent activity, missing core files, or dormant development patterns."

    summary = HealthSummary(
        overall_score=overall_score,
        is_provisional=is_provisional,
        coverage_percentage=coverage_pct,
        status_label=status_label,
        status_tone=status_tone,
        short_explanation=short_exp,
        scoring_version=settings.SCORING_VERSION
    )

    return summary, categories, insights
