from app.services.readme_analyzer import analyze_readme
from app.services.commit_analyzer import analyze_commits
from app.services.issue_analyzer import analyze_issues_and_prs
from app.services.contributor_analyzer import analyze_contributors
from app.services.github_client import GitHubClient

def test_url_parser():
    owner, repo = GitHubClient.parse_repository_url("https://github.com/facebook/react")
    assert owner == "facebook"
    assert repo == "react"

    owner, repo = GitHubClient.parse_repository_url("https://github.com/torvalds/linux.git/")
    assert owner == "torvalds"
    assert repo == "linux"

    owner, repo = GitHubClient.parse_repository_url("pallets/flask")
    assert owner == "pallets"
    assert repo == "flask"

def test_readme_analyzer_detection():
    sample_readme = """
    # My Cool Project

    A fast and modular project.

    ## Installation
    Run `pip install cool-project` or clone the repository.

    ## Usage
    ```python
    import cool_project
    cool_project.start()
    ```

    ## Contributing
    Please submit pull requests to the develop branch.

    ## License
    MIT License.
    """
    metrics = analyze_readme(sample_readme)
    assert metrics.has_readme is True
    assert metrics.has_installation is True
    assert metrics.has_usage is True
    assert metrics.has_contributing is True
    assert metrics.has_license_section is True
    assert metrics.has_code_examples is True
    assert metrics.word_count > 20

def test_readme_analyzer_empty():
    metrics = analyze_readme("")
    assert metrics.has_readme is False
    assert metrics.word_count == 0
    assert metrics.has_installation is False

def test_issue_pr_separation():
    # In GitHub, issues endpoint returns both issues and PRs (PRs have "pull_request" key)
    raw_issues = [
        {"id": 1, "state": "open"},  # Issue
        {"id": 2, "state": "closed"}, # Issue
        {"id": 3, "state": "open", "pull_request": {"url": "..."}}, # PR in issues endpoint
        {"id": 4, "state": "closed", "pull_request": {"url": "..."}} # PR in issues endpoint
    ]
    raw_pulls = [
        {"id": 3, "state": "open", "merged_at": None},
        {"id": 4, "state": "closed", "merged_at": "2026-10-01T00:00:00Z"}
    ]

    metrics = analyze_issues_and_prs(raw_issues, raw_pulls, has_issues_enabled=True)
    # Only issues 1 & 2 should be counted as issues!
    assert metrics.open_issues_count == 1
    assert metrics.closed_issues_count == 1
    assert metrics.open_prs_count == 1
    assert metrics.closed_prs_count == 1
    assert metrics.merged_prs_count == 1

def test_contributor_bus_factor():
    contributors = [
        {"login": "lead_dev", "contributions": 95, "avatar_url": None},
        {"login": "helper1", "contributions": 3, "avatar_url": None},
        {"login": "helper2", "contributions": 2, "avatar_url": None}
    ]
    metrics = analyze_contributors(contributors)
    assert metrics.total_contributors == 3
    assert metrics.top_contributor_share_percent == 95.0
    assert metrics.bus_factor_risk == "high"
