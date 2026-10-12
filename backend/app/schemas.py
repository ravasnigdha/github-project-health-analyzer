from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    repository_url: str = Field(..., description="Public GitHub repository URL, e.g. https://github.com/owner/repo")

class CompareRequest(BaseModel):
    repository_url_1: str = Field(..., description="First GitHub repository URL")
    repository_url_2: str = Field(..., description="Second GitHub repository URL")

class CheckResult(BaseModel):
    id: str
    title: str
    category: str
    earned_points: float
    max_points: float
    status: str  # "passed", "warning", "failed", "unavailable"
    explanation: str
    evidence: str

class CategoryScore(BaseModel):
    category_id: str
    title: str
    weight: float
    earned_points: float
    max_points: float
    percentage: float
    status: str  # "strong", "moderate", "weak", "unavailable"
    interpretation: str
    checks: List[CheckResult]

class CommitTimelinePoint(BaseModel):
    date: str
    count: int
    label: str

class CommitMetrics(BaseModel):
    total_sampled: int
    days_since_last_commit: Optional[int] = None
    last_commit_date: Optional[str] = None
    commits_last_30_days: int = 0
    commits_last_90_days: int = 0
    timeline_30d: List[CommitTimelinePoint] = []
    timeline_90d: List[CommitTimelinePoint] = []
    timeline_180d: List[CommitTimelinePoint] = []

class ReadmeSection(BaseModel):
    name: str
    detected: bool
    evidence: Optional[str] = None

class DocumentationMetrics(BaseModel):
    has_readme: bool
    word_count: int
    has_installation: bool
    has_usage: bool
    has_contributing: bool
    has_license_section: bool
    has_code_examples: bool
    detected_sections: List[ReadmeSection] = []

class IssuePRMetrics(BaseModel):
    open_issues_count: int
    closed_issues_count: int
    open_prs_count: int
    closed_prs_count: int
    merged_prs_count: int
    pr_to_issue_ratio: Optional[float] = None
    issue_closure_rate: Optional[float] = None
    issues_enabled: bool = True

class ContributorInfo(BaseModel):
    login: str
    avatar_url: Optional[str] = None
    contributions: int
    share_percent: float

class ContributorMetrics(BaseModel):
    total_contributors: int
    top_contributor_share_percent: float
    bus_factor_risk: str  # "low", "moderate", "high"
    top_contributors: List[ContributorInfo] = []

class RepositoryMetadata(BaseModel):
    owner: str
    repo: str
    full_name: str
    html_url: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    watchers_count: int = 0
    license_name: Optional[str] = None
    license_spdx: Optional[str] = None
    default_branch: str = "main"
    created_at: str
    updated_at: str
    pushed_at: str
    is_archived: bool = False
    topics: List[str] = []
    has_issues_enabled: bool = True
    has_wiki_enabled: bool = False
    has_contributing_file: bool = False
    has_code_of_conduct: bool = False
    has_issue_templates: bool = False

class Recommendation(BaseModel):
    id: str
    title: str
    priority: str  # "high", "medium", "low"
    category: str
    explanation: str
    evidence: str
    suggested_action: str

class HealthSummary(BaseModel):
    overall_score: int
    is_provisional: bool
    coverage_percentage: float
    status_label: str
    status_tone: str  # "positive", "neutral", "warning", "critical"
    short_explanation: str
    scoring_version: str

class AnalyzeResponse(BaseModel):
    metadata: RepositoryMetadata
    summary: HealthSummary
    categories: List[CategoryScore]
    commits: CommitMetrics
    docs: DocumentationMetrics
    issues_prs: IssuePRMetrics
    contributors: ContributorMetrics
    recommendations: List[Recommendation]
    insights: List[str]
    analyzed_at: str
    from_cache: bool = False

class CompareResponse(BaseModel):
    repo_1: AnalyzeResponse
    repo_2: AnalyzeResponse
    comparison_summary: str
    category_deltas: Dict[str, float]

class RateLimitResponse(BaseModel):
    limit: int
    remaining: int
    reset_timestamp: int
    reset_time_utc: str
    is_authenticated: bool

class HealthCheckResponse(BaseModel):
    status: str
    uptime_seconds: float
    version: str
    cached_repos: int
