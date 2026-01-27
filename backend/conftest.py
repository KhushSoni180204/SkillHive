# conftest.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from unittest.mock import patch


User = get_user_model()

@pytest.fixture(autouse=True)
def mock_gemini_generate():
    """
    Mock Gemini AI for ALL tests to prevent real API calls.
    """
    with patch("ai_learning.views.GeminiService.generate") as mock_generate:
        mock_generate.return_value = """
        {
          "questions": [
            {
              "question": "Mock question?",
              "options": ["A", "B", "C", "D"],
              "answer": "A",
              "explanation": "Mock explanation"
            }
          ]
        }
        """
        yield mock_generate

@pytest.fixture
def api_client():
    """Return fresh DRF API client."""
    return APIClient()

@pytest.fixture
def student_user(db):
    """Create a mock student."""
    return User.objects.create_user(
        email="test@gmail.com",
        username="test",
        password="123",
        user_role="student"
    )

@pytest.fixture
def instructor_user(db):
    """Create a mock instructor."""
    return User.objects.create_user(
        email="instructor@gmail.com",
        username="instructor",
        password="123",
        user_role="instructor"
    )


@pytest.fixture
def student_client(api_client, student_user):
    """Return API client authenticated as student."""
    login = api_client.post("/api/auth/login/", {
        "email": student_user.email,
        "password": "123"
    })
    
    token = login.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    return api_client

@pytest.fixture
def instructor_client(api_client, instructor_user):
    """Return API client authenticated as instructor."""
    login = api_client.post("/api/auth/login/", {
        "email": instructor_user.email,
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
        lesson_name="Models",
        content="Django models define DB structure",
        duration=10
    )

from enrollments.models import Enrollment

@pytest.fixture
def enrollment(db, student_user, sample_course):
    return Enrollment.objects.create(
        user=student_user,
        course=sample_course
    )