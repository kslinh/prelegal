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

def test_create_document(client, auth_headers):
    response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "My NDA",
            "content": "This is my NDA",
            "customizations": "{}",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["template_id"] == "nda-001"
    assert data["title"] == "My NDA"
    assert "id" in data

def test_list_documents(client, auth_headers):
    client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "My NDA",
            "content": "This is my NDA",
            "customizations": "{}",
        },
    )
    response = client.get("/documents", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["template_id"] == "nda-001"

def test_get_document(client, auth_headers):
    create_response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "My NDA",
            "content": "This is my NDA",
            "customizations": "{}",
        },
    )
    doc_id = create_response.json()["id"]
    response = client.get(f"/documents/{doc_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == doc_id
    assert data["template_id"] == "nda-001"

def test_update_document(client, auth_headers):
    create_response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "My NDA",
            "content": "This is my NDA",
            "customizations": "{}",
        },
    )
    doc_id = create_response.json()["id"]
    response = client.put(
        f"/documents/{doc_id}",
        headers=auth_headers,
        json={
            "title": "Updated NDA",
            "content": "Updated content",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated NDA"
    assert data["content"] == "Updated content"

def test_delete_document(client, auth_headers):
    create_response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "My NDA",
            "content": "This is my NDA",
            "customizations": "{}",
        },
    )
    doc_id = create_response.json()["id"]
    response = client.delete(f"/documents/{doc_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Document deleted"

    # Verify document is gone
    response = client.get(f"/documents/{doc_id}", headers=auth_headers)
    assert response.status_code == 404

def test_get_other_users_document(client, auth_headers):
    # User 1 creates document
    create_response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "My NDA",
            "content": "This is my NDA",
            "customizations": "{}",
        },
    )
    doc_id = create_response.json()["id"]

    # User 2 signs up
    client.post(
        "/auth/signup",
        json={
            "email": "user2@example.com",
            "password": "testpass123",
            "full_name": "User 2",
        },
    )
    response = client.post(
        "/auth/signin",
        json={"email": "user2@example.com", "password": "testpass123"},
    )
    token = response.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token}"}

    # User 2 tries to access User 1's document
    response = client.get(f"/documents/{doc_id}", headers=headers2)
    assert response.status_code == 404

def test_create_document_with_long_content(client, auth_headers):
    """Test creating a document with very long content."""
    long_content = "Test content. " * 50000  # Create ~700KB of content
    response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": "Long Content Test",
            "content": long_content,
            "customizations": "{}",
        },
    )
    # Should succeed - SQLite can handle large text fields
    assert response.status_code == 200
    assert "id" in response.json()


def test_create_document_with_very_long_title(client, auth_headers):
    """Test creating a document with a very long title."""
    long_title = "A" * 10000  # 10KB title
    response = client.post(
        "/documents",
        headers=auth_headers,
        json={
            "template_id": "nda-001",
            "title": long_title,
            "content": "Test content",
            "customizations": "{}",
        },
    )
    # Should succeed
    assert response.status_code == 200
    assert "id" in response.json()
