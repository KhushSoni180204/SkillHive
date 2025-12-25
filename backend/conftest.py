# conftest.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    """Return fresh DRF API client."""
    return APIClient()

@pytest.fixture
def student_user(db):
    """Create a mock student."""
    return User.objects.create_user(
        username="student_test",
        password="123",
        user_role="student"
    )

@pytest.fixture
def instructor_user(db):
    """Create a mock instructor."""
    return User.objects.create_user(
        username="instructor_test",
        password="123",
        user_role="instructor"
    )


@pytest.fixture
def student_client(api_client, student_user):
    """Return API client authenticated as student."""
    login = api_client.post("/api/auth/login/", {
        "username": student_user.username,
        "password": "123"
    })
    
    token = login.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    return api_client

@pytest.fixture
def instructor_client(api_client, instructor_user):
    """Return API client authenticated as instructor."""
    login = api_client.post("/api/auth/login/", {
        "username": instructor_user.username,
        "password": "123"
    })
    
    token = login.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    return api_client


from courses.models import Course

@pytest.fixture
def sample_course(instructor_user):
    """Create mock course owned by instructor."""
    return Course.objects.create(
        instructor=instructor_user,
        course_name="Test Course",
        description="A sample course for testing",
        status="published"
    )

from courses.models import Module, Lesson

@pytest.fixture
def sample_module(sample_course):
    return Module.objects.create(
        course=sample_course,
        module_name="Intro",
        module_order=1,
        summary="Module summary"
    )

@pytest.fixture
def sample_lesson(sample_module):
    return Lesson.objects.create(
        module=sample_module,
        lesson_name="Lesson 1",
        content="Some content",
        duration=10
    )
