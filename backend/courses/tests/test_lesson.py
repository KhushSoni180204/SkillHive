import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from courses.models import Course, Module, Lesson

User = get_user_model()

@pytest.mark.django_db
def test_instructor_can_create_lesson():
    instructor = User.objects.create_user(
        username="teacher",
        password="123",
        user_role="instructor"
    )

    client = APIClient()
    login = client.post("/api/auth/login/", {
        "username": "teacher",
        "password": "123"
    })
    token = login.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    # Create Course
    course = client.post("/api/courses/", {
        "course_name": "Django",
        "description": "Backend"
    }).data

    # Create Module
    module = client.post("/api/modules/", {
        "course": course["id"],
        "module_name": "Setup",
        "module_order": 1
    }).data

    # Create Lesson
    res = client.post("/api/lessons/", {
        "module": module["id"],
        "lesson_name": "Install Django",
        "content": "pip install django"
    })

    assert res.status_code == 201
    assert Lesson.objects.count() == 1
