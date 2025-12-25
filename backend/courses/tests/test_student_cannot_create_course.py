import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
User = get_user_model()

@pytest.mark.django_db
def test_student_cannot_create_course():
    user = User.objects.create_user(
        username="student1",
        password="123",
        user_role="student"
    )

    client = APIClient()

    login = client.post("/api/auth/login/", {
        "username": "student1",
        "password": "123",
    })

    token = login.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    res = client.post("/api/courses/", {
        "course_name": "Hack Course",
        "description": "Trying to create"
    })

    assert res.status_code == 403  # Forbidden
