import pytest
from fastapi import status
import json


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


def test_document_chat_field_extraction(client, auth_headers, monkeypatch):
    """Test that field names are normalized correctly (case-insensitive)."""
    # Mock the LLM response with lowercase field names
    def mock_completion(*args, **kwargs):
        class MockResponse:
            class Choice:
                class Message:
                    content = json.dumps({
                        "reply": "I'll help you create an NDA.",
                        "extracted_fields": {
                            "purpose": "Sharing proprietary code",
                            "effective date": "2026-06-24",
                            "jurisdiction": "California"
                        }
                    })
                message = Message()
            choices = [Choice()]
        return MockResponse()

    import app.routes.chat as chat_module
    monkeypatch.setattr(chat_module, "completion", mock_completion)

    response = client.post(
        "/api/chat/document/nda-001",
        headers=auth_headers,
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "I want to create an NDA for sharing proprietary code starting June 24, 2026 with California law."
                }
            ],
            "current_fields": {}
        },
    )

    assert response.status_code == 200
    data = response.json()

    # Verify the response structure
    assert "reply" in data
    assert "extracted_fields" in data

    # Verify fields are extracted with proper casing
    fields = data["extracted_fields"]
    assert "Purpose" in fields  # Should be capitalized
    assert "Effective Date" in fields  # Should match template field name
    assert "Jurisdiction" in fields  # Should match template field name
    assert fields["Purpose"] == "Sharing proprietary code"
    assert fields["Effective Date"] == "2026-06-24"
    assert fields["Jurisdiction"] == "California"


def test_document_chat_template_validation(client, auth_headers, monkeypatch):
    """Test that only valid template fields are returned."""
    def mock_completion(*args, **kwargs):
        class MockResponse:
            class Choice:
                class Message:
                    content = json.dumps({
                        "reply": "Got it.",
                        "extracted_fields": {
                            "purpose": "Testing",
                            "invalid_field": "Should be filtered out",
                            "another_invalid": "Also filtered"
                        }
                    })
                message = Message()
            choices = [Choice()]
        return MockResponse()

    import app.routes.chat as chat_module
    monkeypatch.setattr(chat_module, "completion", mock_completion)

    response = client.post(
        "/api/chat/document/nda-001",
        headers=auth_headers,
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Create an NDA"
                }
            ],
            "current_fields": {}
        },
    )

    assert response.status_code == 200
    data = response.json()
    fields = data["extracted_fields"]

    # Should only have the valid field
    assert "Purpose" in fields
    assert "invalid_field" not in fields
    assert "another_invalid" not in fields


def test_document_chat_empty_values_filtered(client, auth_headers, monkeypatch):
    """Test that empty or whitespace-only values are filtered out."""
    def mock_completion(*args, **kwargs):
        class MockResponse:
            class Choice:
                class Message:
                    content = json.dumps({
                        "reply": "Here are the fields.",
                        "extracted_fields": {
                            "purpose": "Valid value",
                            "effective date": "",
                            "jurisdiction": "   ",
                            "term": None
                        }
                    })
                message = Message()
            choices = [Choice()]
        return MockResponse()

    import app.routes.chat as chat_module
    monkeypatch.setattr(chat_module, "completion", mock_completion)

    response = client.post(
        "/api/chat/document/nda-001",
        headers=auth_headers,
        json={
            "messages": [
                {
                    "role": "user",
                    "content": "Create an NDA"
                }
            ],
            "current_fields": {}
        },
    )

    assert response.status_code == 200
    data = response.json()
    fields = data["extracted_fields"]

    # Should only have non-empty fields
    assert "Purpose" in fields
    assert fields["Purpose"] == "Valid value"
    # Empty/whitespace values should be filtered out
    assert len(fields) == 1
