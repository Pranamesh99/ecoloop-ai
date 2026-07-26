import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_latest_telemetry():
    response = client.get("/api/v1/telemetry/latest")
    assert response.status_code == 200
    data = response.json()
    assert "zone_temp_c" in data
    assert "lighting_load_kw" in data

def test_post_logs():
    log_data = {"agent": "Test", "action": "test", "reasoning": "Because"}
    response = client.post("/api/v1/logs", json=log_data)
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

def test_get_logs_history():
    response = client.get("/api/v1/logs/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
