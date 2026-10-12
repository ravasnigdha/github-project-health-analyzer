import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime_seconds" in data
    assert "version" in data

def test_rate_limit_endpoint():
    with patch("app.services.github_client.github_client.get_rate_limit", new_callable=AsyncMock) as mock_rl:
        mock_rl.return_value = {
            "limit": 60,
            "remaining": 45,
            "reset_timestamp": 1700000000,
            "is_authenticated": False
        }
        response = client.get("/api/rate-limit")
        assert response.status_code == 200
        data = response.json()
        assert data["limit"] == 60
        assert data["remaining"] == 45

def test_analyze_invalid_url():
    response = client.post("/api/analyze", json={"repository_url": "not-a-valid-url!!!"})
    assert response.status_code == 400

@patch("app.services.github_client.github_client.fetch_full_repo_data", new_callable=AsyncMock)
def test_analyze_success(mock_fetch):
    mock_fetch.return_value = {
        "metadata": {
            "name": "example-repo",
            "owner": {"login": "sampleowner"},
            "full_name": "sampleowner/example-repo",
            "html_url": "https://github.com/sampleowner/example-repo",
            "description": "Example test repo",
            "language": "Python",
            "stargazers_count": 150,
            "forks_count": 20,
            "open_issues_count": 3,
            "watchers_count": 150,
            "license": {"name": "MIT License", "spdx_id": "MIT"},
            "default_branch": "main",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2026-10-10T00:00:00Z",
            "pushed_at": "2026-10-10T00:00:00Z",
            "archived": False,
            "topics": ["python", "tool"],
            "has_issues": True,
            "has_wiki": False
        },
        "commits": [
            {
                "commit": {
                    "committer": {"date": "2026-10-10T00:00:00Z"},
                    "message": "Update features"
                }
            }
        ],
        "stats_commits": None,
        "readme_text": "# Example\n## Installation\n`pip install`\n## Usage\n`run`\n## Contributing\n`pr`",
        "has_readme": True,
        "issues_raw": [{"id": 1, "state": "open"}],
        "pulls": [{"id": 2, "state": "closed", "merged_at": "2026-10-09T00:00:00Z"}],
        "contributors": [{"login": "sampleowner", "contributions": 50, "avatar_url": None}],
        "community": {"files": {"contributing": True, "code_of_conduct": True, "issue_template": True}},
        "rate_limit_headers": {"remaining": "55", "reset": "1700000000"}
    }

    response = client.post("/api/analyze", json={"repository_url": "https://github.com/sampleowner/example-repo"})
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["full_name"] == "sampleowner/example-repo"
    assert data["summary"]["overall_score"] > 50
    assert len(data["categories"]) == 5
    assert len(data["insights"]) > 0
