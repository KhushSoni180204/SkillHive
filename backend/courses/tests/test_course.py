import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_instructor_can_create_course():
    user = User.objects.create_user(
        username="teacher",
        password="123",
        user_role="instructor"
    )

    client = APIClient()

    # Login to get token
    login = client.post("/api/auth/login/", {
        "username": "teacher",
        "password": "123",
    }, format="json")

    token = login.data["access"]

    # Send create course request
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    res = client.post("/api/courses/", {
        "course_name": "Django",
        "description": "Backend framework"
    })

    assert res.status_code == 201
    assert res.data["course_name"] == "Django"
