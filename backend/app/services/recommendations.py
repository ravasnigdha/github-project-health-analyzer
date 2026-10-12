from typing import List
from ..schemas import CategoryScore, Recommendation

def generate_recommendations(categories: List[CategoryScore]) -> List[Recommendation]:
    """
    Transforms failed or warning checks into actionable, prioritized maintainer recommendations.
    """
    recommendations: List[Recommendation] = []

    # Flatten all checks
    all_checks = []
    for cat in categories:
        all_checks.extend(cat.checks)

    for c in all_checks:
        if c.status in ("failed", "warning"):
            rec = None

            # 1. License Check
            if c.id == "org_license" and c.status == "failed":
                rec = Recommendation(
                    id="rec_license",
                    title="Add an Open Source License",
                    priority="high",
                    category="Repository Organization",
                    explanation="Without an open-source license, default copyright laws apply, which prevents contributors and organizations from legally adopting or modifying your project.",
                    evidence=c.evidence,
                    suggested_action="Add a LICENSE file to the root of your repository (e.g., MIT, Apache 2.0, or BSD) or select a license through GitHub's repository settings."
                )

            # 2. README Check
            elif c.id == "doc_readme" and c.status == "failed":
                rec = Recommendation(
                    id="rec_readme",
                    title="Create a Comprehensive README",
                    priority="high",
                    category="Documentation",
                    explanation="The README is the primary entry point for any developer. A missing or empty README significantly impedes adoption.",
                    evidence=c.evidence,
                    suggested_action="Create a README.md file outlining the project objective, prerequisites, installation steps, and quickstart examples."
                )

            # 3. Installation Section
            elif c.id == "doc_installation" and c.status == "failed":
                rec = Recommendation(
                    id="rec_installation",
                    title="Add Installation & Setup Instructions",
                    priority="high",
                    category="Documentation",
                    explanation="Your README lacks a recognizable Installation or Setup section, making it harder for new users and contributors to run the project.",
                    evidence=c.evidence,
                    suggested_action="Add an '## Installation' heading with runtime prerequisites, dependencies, and setup commands."
                )

            # 4. Usage Guidance
            elif c.id == "doc_usage" and c.status in ("failed", "warning"):
                rec = Recommendation(
                    id="rec_usage",
                    title="Provide Usage Examples and Code Blocks",
                    priority="medium",
                    category="Documentation",
                    explanation="Clear code snippets and usage examples show developers how to use the project without needing to inspect source files.",
                    evidence=c.evidence,
                    suggested_action="Add an '## Usage' section with syntax-highlighted code blocks illustrating common commands or APIs."
                )

            # 5. Contributing Guide
            elif (c.id == "doc_contributing" or c.id == "org_governance") and c.status in ("failed", "warning") and c.earned_points < 3.0:
                rec = Recommendation(
                    id="rec_contributing",
                    title="Add Contributing Guidelines (CONTRIBUTING.md)",
                    priority="medium",
                    category="Documentation",
                    explanation="Contributor guidelines reduce friction by clarifying branch workflows, pull request expectations, and local test procedures.",
                    evidence=c.evidence,
                    suggested_action="Add a CONTRIBUTING.md file in the root or .github/ directory describing branch naming, code style, and testing requirements."
                )

            # 6. Maintenance & Recency
            elif c.id == "maint_recency" and c.status in ("failed", "warning"):
                rec = Recommendation(
                    id="rec_commit_cadence",
                    title="Resume Active Commit Cadence or Clarify Project Status",
                    priority="high" if c.status == "failed" else "medium",
                    category="Maintenance & Activity",
                    explanation="No commits were observed in recent months. Long periods of silence can lead prospective users to assume the project is abandoned.",
                    evidence=c.evidence,
                    suggested_action="Push dependency upgrades or bug fixes, or add a notice in the README clarifying whether the project is stable, feature-complete, or seeking co-maintainers."
                )

            # 7. Bus Factor / Contributor Diversity
            elif c.id == "contrib_bus_factor" and c.status == "warning":
                rec = Recommendation(
                    id="rec_bus_factor",
                    title="Distribute Maintenance Responsibilities",
                    priority="low",
                    category="Contributor Activity",
                    explanation="A high percentage of commits originates from a single contributor. Sharing ownership ensures sustainability if the primary author becomes unavailable.",
                    evidence=c.evidence,
                    suggested_action="Label beginner-friendly issues as 'good first issue' and invite regular contributors into triage or co-maintainer roles."
                )

            # 8. Description & Topics
            elif c.id == "org_metadata" and c.status in ("failed", "warning"):
                rec = Recommendation(
                    id="rec_topics",
                    title="Add Repository Description and GitHub Topics",
                    priority="low",
                    category="Repository Organization",
                    explanation="Tags and descriptions improve discoverability on GitHub search and help developers quickly understand your project's domain.",
                    evidence=c.evidence,
                    suggested_action="Click the gear icon on your GitHub repository overview to add a concise description and at least 3-5 relevant topics."
                )

            # 9. Issue Backlog
            elif c.id == "issue_resolution" and c.status == "warning":
                rec = Recommendation(
                    id="rec_issues",
                    title="Triage Inactive or Stale Issues",
                    priority="medium",
                    category="Issues & Pull Requests",
                    explanation="A low issue closure rate indicates open tickets may be accumulating without responses, which can discourage community contributions.",
                    evidence=c.evidence,
                    suggested_action="Review open tickets, close resolved or obsolete questions, and set up GitHub issue templates to streamline incoming reports."
                )

            if rec and not any(existing.id == rec.id for existing in recommendations):
                recommendations.append(rec)

    # Order recommendations by priority: high -> medium -> low
    priority_order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda r: priority_order.get(r.priority, 3))

    return recommendations
