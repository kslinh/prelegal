import pytest
from fastapi import status

def test_signup_success(client):
    response = client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data

def test_signup_duplicate_email(client):
    client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Test User",
        },
    )
    response = client.post(
        "/auth/signup",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "full_name": "Another User",
        },
    )
    assert response.status_code == 400

def test_signin_success(client):
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
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_signin_wrong_password(client):
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
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401

def test_signin_nonexistent_user(client):
    response = client.post(
        "/auth/signin",
        json={"email": "nonexistent@example.com", "password": "testpass123"},
    )
    assert response.status_code == 401
