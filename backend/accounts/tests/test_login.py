import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_login_returns_jwt():
    # Create user
    user = User.objects.create_user(
        username="john",
        email="john@gmail.com",
        password="12345",
        user_role="student"
    )

    client = APIClient()

    response = client.post("/api/auth/login/", {
        "email": "john@gmail.com",
        "password": "12345",
    }, format="json")

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
