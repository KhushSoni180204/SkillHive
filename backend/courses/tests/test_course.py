import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_instructor_can_create_course(instructor_user):
    client = APIClient()

    client.force_authenticate(user=instructor_user)

    res = client.post("/api/courses/", {
        "course_name": "Django",
        "description": "Backend framework"
    })

    assert res.status_code == 201
    assert res.data["course_name"] == "Django"
