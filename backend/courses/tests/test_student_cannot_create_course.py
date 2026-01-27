import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
User = get_user_model()

@pytest.mark.django_db
def test_student_cannot_create_course(student_user):
    client = APIClient()
    client.force_authenticate(user=student_user)

    res = client.post("/api/courses/", {
        "course_name": "Hack Course",
        "description": "Trying to create"
    })

    assert res.status_code == 403  # Forbidden
