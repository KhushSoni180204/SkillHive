import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from courses.models import Course, Module

User = get_user_model()

@pytest.mark.django_db
def test_instructor_can_create_module():
    instructor = User.objects.create_user(
        username="teacher",
        password="123",
        user_role="instructor"
    )

    # Login
    client = APIClient()
    login = client.post("/api/auth/login/", {
        "username": "teacher",
        "password": "123"
    })
    token = login.data["access"]

    # Create a course first
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    course = client.post("/api/courses/", {
        "course_name": "Python",
        "description": "Intro"
    }).data

    # Create module
    res = client.post("/api/modules/", {
        "course": course["id"],
        "module_name": "Basics",
        "module_order": 1
    })

    assert res.status_code == 201
    assert Module.objects.count() == 1
