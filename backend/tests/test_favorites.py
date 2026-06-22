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

def test_add_favorite(client, auth_headers):
    response = client.post(
        "/favorites",
        headers=auth_headers,
        json={"template_id": "nda-001"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["template_id"] == "nda-001"
    assert "id" in data

def test_list_favorites(client, auth_headers):
    client.post(
        "/favorites",
        headers=auth_headers,
        json={"template_id": "nda-001"},
    )
    client.post(
        "/favorites",
        headers=auth_headers,
        json={"template_id": "mnda-001"},
    )
    response = client.get("/favorites", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_remove_favorite(client, auth_headers):
    client.post(
        "/favorites",
        headers=auth_headers,
        json={"template_id": "nda-001"},
    )
    response = client.delete(
        "/favorites/nda-001",
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Favorite removed"

    # Verify favorite is gone
    response = client.get("/favorites", headers=auth_headers)
    assert len(response.json()) == 0

def test_add_duplicate_favorite(client, auth_headers):
    client.post(
        "/favorites",
        headers=auth_headers,
        json={"template_id": "nda-001"},
    )
    response = client.post(
        "/favorites",
        headers=auth_headers,
        json={"template_id": "nda-001"},
    )
    assert response.status_code == 400
