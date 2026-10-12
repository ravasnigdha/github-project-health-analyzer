import pytest
from app.schemas import (
    RepositoryMetadata, CommitMetrics, DocumentationMetrics,
    IssuePRMetrics, ContributorMetrics
)
from app.services.health_scorer import calculate_health_score
from app.services.recommendations import generate_recommendations

def test_perfect_repository_scoring():
    meta = RepositoryMetadata(
        owner="fastapi",
        repo="fastapi",
        full_name="fastapi/fastapi",
        html_url="https://github.com/fastapi/fastapi",
        description="FastAPI framework, high performance, easy to learn.",
        language="Python",
        stars_count=75000,
        forks_count=6000,
        open_issues_count=12,
        watchers_count=1000,
        license_name="MIT License",
        license_spdx="MIT",
        default_branch="master",
        created_at="2018-12-08T18:00:00Z",
        updated_at="2026-10-11T12:00:00Z",
        pushed_at="2026-10-11T12:00:00Z",
        is_archived=False,
        topics=["python", "fastapi", "api", "asyncio"],
        has_issues_enabled=True,
        has_wiki_enabled=False,
        has_contributing_file=True,
        has_code_of_conduct=True,
        has_issue_templates=True
    )
    commits = CommitMetrics(
        total_sampled=100,
        days_since_last_commit=2,
        last_commit_date="2026-10-09T12:00:00Z",
        commits_last_30_days=18,
        commits_last_90_days=45,
        timeline_30d=[],
        timeline_90d=[],
        timeline_180d=[]
    )
    docs = DocumentationMetrics(
        has_readme=True,
        word_count=1200,
        has_installation=True,
        has_usage=True,
        has_contributing=True,
        has_license_section=True,
        has_code_examples=True,
        detected_sections=[]
    )
    issues = IssuePRMetrics(
        open_issues_count=12,
        closed_issues_count=88,
        open_prs_count=5,
        closed_prs_count=95,
        merged_prs_count=80,
        pr_to_issue_ratio=0.42,
        issue_closure_rate=0.88,
        issues_enabled=True
    )
    contributors = ContributorMetrics(
        total_contributors=28,
        top_contributor_share_percent=32.0,
        bus_factor_risk="low",
        top_contributors=[]
    )

    summary, categories, insights = calculate_health_score(meta, commits, docs, issues, contributors)
    
    # Assert score is strong (>= 85)
    assert summary.overall_score >= 85
    assert summary.status_label == "Strong indicators"
    assert summary.is_provisional is False
    assert summary.coverage_percentage == 100.0
    assert len(categories) == 5

    recs = generate_recommendations(categories)
    # A near-perfect repository should have no high-priority recommendations
    assert not any(r.priority == "high" for r in recs)

def test_dormant_repository_scoring():
    meta = RepositoryMetadata(
        owner="olduser",
        repo="abandoned-project",
        full_name="olduser/abandoned-project",
        html_url="https://github.com/olduser/abandoned-project",
        description=None,
        language="C",
        stars_count=3,
        forks_count=0,
        open_issues_count=15,
        watchers_count=1,
        license_name=None,
        license_spdx=None,
        default_branch="master",
        created_at="2016-01-01T00:00:00Z",
        updated_at="2019-01-01T00:00:00Z",
        pushed_at="2019-01-01T00:00:00Z",
        is_archived=False,
        topics=[],
        has_issues_enabled=True,
        has_wiki_enabled=False,
        has_contributing_file=False,
        has_code_of_conduct=False,
        has_issue_templates=False
    )
    commits = CommitMetrics(
        total_sampled=10,
        days_since_last_commit=800,
        last_commit_date="2020-01-01T00:00:00Z",
        commits_last_30_days=0,
        commits_last_90_days=0,
        timeline_30d=[],
        timeline_90d=[],
        timeline_180d=[]
    )
    docs = DocumentationMetrics(
        has_readme=False,
        word_count=0,
        has_installation=False,
        has_usage=False,
        has_contributing=False,
        has_license_section=False,
        has_code_examples=False,
        detected_sections=[]
    )
    issues = IssuePRMetrics(
        open_issues_count=15,
        closed_issues_count=0,
        open_prs_count=0,
        closed_prs_count=0,
        merged_prs_count=0,
        pr_to_issue_ratio=0.0,
        issue_closure_rate=0.0,
        issues_enabled=True
    )
    contributors = ContributorMetrics(
        total_contributors=1,
        top_contributor_share_percent=100.0,
        bus_factor_risk="moderate",
        top_contributors=[]
    )

    summary, categories, insights = calculate_health_score(meta, commits, docs, issues, contributors)
    
    # Assert score is low (< 50)
    assert summary.overall_score < 50
    assert summary.status_label == "Significant concerns"
    
    recs = generate_recommendations(categories)
    assert any(r.id == "rec_license" for r in recs)
    assert any(r.id == "rec_readme" for r in recs)

def test_provisional_score_when_issues_disabled():
    meta = RepositoryMetadata(
        owner="team",
        repo="tool",
        full_name="team/tool",
        html_url="https://github.com/team/tool",
        description="A tool with issues disabled",
        language="Rust",
        stars_count=100,
        forks_count=10,
        open_issues_count=0,
        watchers_count=10,
        license_name="MIT License",
        license_spdx="MIT",
        default_branch="main",
        created_at="2024-01-01T00:00:00Z",
        updated_at="2026-10-01T00:00:00Z",
        pushed_at="2026-10-01T00:00:00Z",
        is_archived=False,
        topics=["rust"],
        has_issues_enabled=False,
        has_wiki_enabled=False,
        has_contributing_file=False,
        has_code_of_conduct=False,
        has_issue_templates=False
    )
    commits = CommitMetrics(
        total_sampled=20,
        days_since_last_commit=10,
        commits_last_30_days=5,
        commits_last_90_days=15
    )
    docs = DocumentationMetrics(
        has_readme=True,
        word_count=500,
        has_installation=True,
        has_usage=True,
        has_contributing=False,
        has_license_section=True,
        has_code_examples=True
    )
    issues = IssuePRMetrics(
        open_issues_count=0,
        closed_issues_count=0,
        open_prs_count=0,
        closed_prs_count=0,
        merged_prs_count=0,
        issues_enabled=False
    )
    contributors = ContributorMetrics(
        total_contributors=3,
        top_contributor_share_percent=50.0,
        bus_factor_risk="low"
    )

    summary, categories, _ = calculate_health_score(meta, commits, docs, issues, contributors)
    
    # Issues category is 20 points, so available points = 80
    assert summary.is_provisional is True
    assert summary.coverage_percentage == 80.0
    # Overall score must be normalized out of 100
    assert 0 <= summary.overall_score <= 100
