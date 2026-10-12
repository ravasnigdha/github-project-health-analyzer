# GitHub Project Health Analyzer

> **Understand. Improve. Build better.**  
> An advanced full-stack developer portfolio tool that analyzes public GitHub repositories and calculates an explainable, deterministic health score out of 100 based on observable activity, documentation, issue patterns, contributor diversity, and repository governance.

---

## 1. Problem Statement

Open-source users, engineering students, hiring managers, and maintainers often need to answer practical questions before adopting or contributing to a project:
- *Is this repository actively maintained or dormant?*
- *Can newcomers quickly install and run the code from the documentation?*
- *Are community issues addressed in a timely manner or left in backlog limbo?*
- *Is the codebase vulnerable to a "bus factor" where one author carries the entire project?*
- *What actionable steps can maintainers take right now to improve health?*

Raw star and fork counts can be misleading indicators of repository health. **GitHub Project Health Analyzer** evaluates real, observable signals retrieved via the GitHub REST API and computes a fully transparent, rule-based 100-point score without arbitrary AI hallucinations or black-box guesswork.

> **Evaluation Disclaimer**: The health score reflects observable repository signals (commit recency, README substance, issue ratios, governance files). It does not guarantee code security, runtime correctness, or architectural quality.

---

## 2. Key Features

- **Explainable Health Score (0–100)**: Evaluated across 5 documented categories with individual checks, awarded points, status badges, and observable evidence.
- **Fairness & Provisional Scoring**: Missing information (e.g. repositories with issues disabled) does not trigger unfair penalties; the engine calculates a normalized provisional score with explicit coverage transparency.
- **Commit Activity Visualization**: Responsive Recharts bar chart plotting daily, weekly, and bi-weekly commit frequencies across 30, 90, and 180-day intervals.
- **Issue & Pull Request Separation**: Separates GitHub issues from Pull Requests to evaluate backlog health accurately without confounding community bug reports with code contributions.
- **Contributor Diversity & Bus Factor**: Analyzes top contributor commit shares and highlights sustainability risks when a repository depends on a single author.
- **Prioritized Recommendations Engine**: Automatically generates high, medium, and low priority maintainer recommendations backed by observed evidence.
- **Side-by-Side Repository Comparison**: Compare two open-source projects across all health dimensions with category delta calculations.
- **Browser-Local History**: Searchable history stored strictly in client `localStorage` with instantaneous report restoration and deletion controls.
- **In-Memory TTL Caching**: Backend 15-minute in-memory cache to conserve GitHub REST API quotas and accelerate repetitive lookups.
- **Clean Developer Aesthetics**: Human-designed interface adhering to an 8px spacing grid, Inter typography, and a curated Teal/Slate design system with accessible contrast.

---

## 3. Architecture

```
                                      +------------------------------------+
                                      |         GitHub REST API            |
                                      +-----------------+------------------+
                                                        |
                                                        | (Async HTTPX + In-Memory Cache)
                                                        v
+-----------------------------------+       +------------------------------------+
|          React + Vite UI          |       |          FastAPI Backend           |
|                                   |       |                                    |
| - Dashboard (Overview, Scores)    | <---> | - POST /api/analyze                |
| - Detailed Report (6 deep tabs)   | REST  | - POST /api/compare                |
| - Analysis History (LocalStorage) | JSON  | - GET  /api/rate-limit             |
| - Side-by-Side Compare Page       |       | - GET  /api/health                 |
| - Settings & Rate Limit Monitor   |       | - POST /api/cache/clear            |
+-----------------------------------+       +-----------------+------------------+
                                                              |
                                                              v
                                            +------------------------------------+
                                            |  Deterministic Health Score Engine |
                                            |  - Maintenance & Commits (25 pts)  |
                                            |  - Documentation (20 pts)          |
                                            |  - Issues & Pull Requests (20 pts) |
                                            |  - Contributor Activity (15 pts)   |
                                            |  - Repository Organization (20 pts)|
                                            +------------------------------------+
```

---

## 4. Technology Stack

### Frontend
- **React 18**: Component-driven user interface.
- **Vite 5**: Fast build tool and development server.
- **React Router v6**: Client-side single-page routing (`/`, `/report`, `/history`, `/compare`, `/settings`).
- **Recharts**: Responsive SVG bar charts for commit timelines.
- **Lucide React**: Clean, modern iconography.
- **Custom CSS Design Tokens**: Modular tokens for typography, spacing, colors, and shadows.

### Backend
- **Python 3.10+**: Core backend runtime.
- **FastAPI**: Modern, asynchronous REST API framework with automatic OpenAPI documentation.
- **Uvicorn**: High-performance ASGI server.
- **HTTPX**: Asynchronous HTTP client for concurrent GitHub REST API queries.
- **Pydantic v2**: Strict request and response schemas and validation.
- **Pytest**: Automated test suite with mocked GitHub fixtures.

---

## 5. Repository Structure

```
github-project-health-analyzer/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI application & middleware
│   │   ├── config.py                  # Settings & environment configuration
│   │   ├── schemas.py                 # Pydantic request/response schemas
│   │   ├── api/
│   │   │   └── routes.py              # Endpoints: /analyze, /compare, /rate-limit, etc.
│   │   └── services/
│   │       ├── cache.py               # In-memory TTL cache
│   │       ├── github_client.py       # Async GitHub REST API client & URL parser
│   │       ├── commit_analyzer.py     # Commit recency, cadence & timeline generator
│   │       ├── readme_analyzer.py     # Markdown section detection & word counts
│   │       ├── issue_analyzer.py      # Issue vs PR separation & closure rates
│   │       ├── contributor_analyzer.py# Community size & bus factor analysis
│   │       ├── repository_analyzer.py # Metadata, license & community files
│   │       ├── health_scorer.py       # Deterministic 5-category scoring engine
│   │       └── recommendations.py     # Prioritized maintainer guidance engine
│   ├── tests/
│   │   ├── test_api.py                # API integration tests with mocked client
│   │   ├── test_health_scorer.py      # Unit tests for scoring & provisional normalization
│   │   └── test_repository_analyzer.py# Tests for commit, README, and issue analyzers
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx            # Persistent desktop sidebar & mobile drawer
│   │   │   ├── Header.jsx             # System status & rate limit header
│   │   │   ├── RepositorySearch.jsx   # URL search bar with validation & sample pills
│   │   │   ├── HealthScoreCard.jsx    # Circular score gauge & coverage indicator
│   │   │   ├── CategoryScoreCard.jsx  # Progress bars & collapsible evidence checks
│   │   │   ├── MetricCard.jsx         # Summary stats card
│   │   │   ├── CommitActivityChart.jsx# Recharts commit activity timeline
│   │   │   ├── InsightsPanel.jsx      # Telemetry-backed observations
│   │   │   ├── RecommendationsPanel.jsx# Prioritized action items
│   │   │   ├── LoadingState.jsx       # Step-by-step progress indicator
│   │   │   └── ErrorState.jsx         # Error handler for 404, rate limits, and network
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main landing & analysis page
│   │   │   ├── RepositoryReport.jsx   # Deep-dive 6-tab report with export options
│   │   │   ├── History.jsx            # LocalStorage analysis history table
│   │   │   ├── Compare.jsx            # Side-by-side repository comparison
│   │   │   └── Settings.jsx           # Quota monitor, cache flushing & architecture
│   │   ├── services/
│   │   │   ├── api.js                 # Backend API client
│   │   │   └── historyStorage.js      # LocalStorage manager
│   │   ├── styles/
│   │   │   ├── tokens.css             # Colors, typography, spacing, radius tokens
│   │   │   └── global.css             # Base stylesheet, buttons, cards, badges
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── README.md
└── .gitignore
```

---

## 6. Scoring Methodology

The health engine evaluates 100 points across five core categories:

| Category | Weight | Evaluated Checks |
| :--- | :--- | :--- |
| **1. Maintenance & Activity** | **25 pts** | • Commit recency (last commit < 14d: 10pts, < 30d: 8pts, < 90d: 5pts, < 180d: 2pts, older: 0pts)<br>• 90-day commit volume & cadence (8pts)<br>• Active development consistency & non-archived posture (7pts) |
| **2. Documentation** | **20 pts** | • README presence & substance (>= 300 words: 7pts, >= 100 words: 5pts)<br>• Installation / setup instructions (5pts)<br>• Usage guidance & code examples (4pts)<br>• Contributing guidance in README or CONTRIBUTING.md (4pts) |
| **3. Issues & Pull Requests** | **20 pts** | • Issue closure & resolution cadence (8pts)<br>• Pull request workflow & merged review history (8pts)<br>• Manageable open issue backlog volume (4pts)<br>*(Handled as unavailable if repository has issues disabled)* |
| **4. Contributor Activity** | **15 pts** | • Contributor diversity (>= 10 authors: 8pts, multi-author: 4-6pts, solo: 3pts)<br>• Bus-factor concentration & commit distribution (4pts)<br>• Recent collaboration engagement (3pts) |
| **5. Repository Organization** | **20 pts** | • Open-source license (OSI recognized: 6pts)<br>• Repository description & searchable topics (4pts)<br>• Community governance files (Code of Conduct, issue templates: 6pts)<br>• Active default branch hygiene (4pts) |

### Score Ranges
- **85–100**: *Strong indicators* (High maintenance velocity, comprehensive documentation, active community).
- **70–84**: *Generally healthy indicators* (Steady project with minor areas for enhancement).
- **50–69**: *Needs attention* (Lacking recent updates, missing license, or sparse documentation).
- **0–49**: *Significant concerns* (Dormant development, archived status, or missing core files).

---

## 7. Installation & Local Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- (Optional) GitHub Personal Access Token to raise hourly rate limits from 60 to 5,000.

### 1. Clone & Navigate
```bash
git clone https://github.com/your-username/github-project-health-analyzer.git
cd github-project-health-analyzer
```

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
```

To optionally configure a token, open `backend/.env`:
```env
GITHUB_TOKEN=ghp_yourPersonalAccessTokenHere
```

Run the backend server:
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
The FastAPI backend will start at `http://127.0.0.1:8000`. You can inspect interactive Swagger documentation at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Vite development server will start at `http://localhost:5173`.

---

## 8. API Reference

### `POST /api/analyze`
Analyzes a public GitHub repository and returns full telemetry and scores.
```json
// Request
{
  "repository_url": "https://github.com/pallets/flask"
}
```

```json
// Response (Truncated preview)
{
  "metadata": {
    "owner": "pallets",
    "repo": "flask",
    "full_name": "pallets/flask",
    "stars_count": 68000,
    "license_spdx": "BSD-3-Clause",
    "language": "Python"
  },
  "summary": {
    "overall_score": 92,
    "is_provisional": false,
    "coverage_percentage": 100.0,
    "status_label": "Strong indicators",
    "status_tone": "positive"
  },
  "categories": [ ... ],
  "commits": { ... },
  "docs": { ... },
  "issues_prs": { ... },
  "contributors": { ... },
  "recommendations": [ ... ],
  "insights": [ ... ]
}
```

### `POST /api/compare`
Compares two public repositories side-by-side.
```json
{
  "repository_url_1": "https://github.com/fastapi/fastapi",
  "repository_url_2": "https://github.com/pallets/flask"
}
```

### `GET /api/rate-limit`
Returns current GitHub API quota and reset timestamp.

### `GET /api/health`
Returns backend operational status, uptime, and cached entries.

### `POST /api/cache/clear`
Clears in-memory repository cache.

---

## 9. Running Tests

Run the Pytest backend test suite:
```bash
cd backend
python -m pytest -v
```
All unit tests run offline using mocked responses and verify:
- URL parsing with trailing slashes, `.git` suffixes, and shorthand strings
- README markdown section regex detection
- Separation of pull requests from the `/issues` endpoint
- Scoring engine bounds, provisional scoring, and recommendation generation
- FastAPI API endpoints and error states

---

## 10. Limitations & Future Enhancements

### Current Limitations
- Analyzes only public repositories (private repositories are intentionally excluded to protect confidential code).
- GitHub REST API enforces a 60 req/hour limit for unauthenticated callers. Adding a free personal token in `.env` increases this to 5,000 req/hour.
- README section parsing relies on standard Markdown headings; unconventional headings might not be recognized.

### Future Roadmap
- Support for GitLab and Bitbucket repositories.
- Code quality & linting analysis via shallow clone and AST parsing.
- CI/CD workflow telemetry (GitHub Actions pass/fail rates).
- Historical trend tracking over multi-year periods.

---

## 11. License

This project is licensed under the [MIT License](LICENSE).
