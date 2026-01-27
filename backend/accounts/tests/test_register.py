import pytest
from django.urls import reverse
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_user_register():
    client = APIClient()

    data = {
        "username": "testuser",
        "email":"test123@gmail.com",
        "password": "testpassword",
        "user_phone": "9876543210",
        "user_role": "student"
    }

    response = client.post("/api/auth/register/", data, format="json")

    assert response.status_code == 201
    assert response.data["username"] == "testuser"
