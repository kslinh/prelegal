import pytest
from fastapi import status

@pytest.fixture
def auth_headers(client):
    client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    response = client.post(
        "/auth/signin",
        json={"email": "test@example.com", "password": "testpass123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_current_user(client, auth_headers):
    response = client.get("/users/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"

def test_get_current_user_unauthorized(client):
    response = client.get("/users/me")
    assert response.status_code == 401
