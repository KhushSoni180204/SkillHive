import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from courses.models import Course, Enrollment

User = get_user_model()

@pytest.mark.django_db
def test_student_can_enroll():
    student = User.objects.create_user(
        username="stud",
        password="123",
        user_role="student"
    )
    instructor = User.objects.create_user(
        username="teach",
        password="123",
        user_role="instructor"
    )

    client = APIClient()

    # Login as instructor to create course
    login_teacher = client.post("/api/auth/login/", {
        "username": "teach",
        "password": "123"
    })
    token_teacher = login_teacher.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_teacher}")

    course = client.post("/api/courses/", {
        "course_name": "Django",
        "description": "Backend"
    }).data

    # Login as student
    login_student = client.post("/api/auth/login/", {
        "username": "stud",
        "password": "123"
    })
    token_student = login_student.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_student}")

    # Enroll
    res = client.post("/api/enrollments/", {"course_id": course["id"]})

    print("ENROLLMENT ERROR:", res.data)
    assert res.status_code == 201
    assert Enrollment.objects.count() == 1


@pytest.mark.django_db
def test_duplicate_enrollment_not_allowed():
    student = User.objects.create_user(
        username="stud",
        password="123",
        user_role="student"
    )
    instructor = User.objects.create_user(
        username="teach",
        password="123",
        user_role="instructor"
    )

    client = APIClient()

    # Instructor creates course
    login_teacher = client.post("/api/auth/login/", {
        "username": "teach",
        "password": "123"
    })
    token_teacher = login_teacher.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_teacher}")

    course = client.post("/api/courses/", {
        "course_name": "React",
        "description": "Frontend"
    }).data

    # Student logs in
    login_student = client.post("/api/auth/login/", {
        "username": "stud",
        "password": "123"
    })
    token_student = login_student.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_student}")

    # First enrollment
    client.post("/api/enrollments/", {"course": course["id"]})

    # Second enrollment attempt
    res = client.post("/api/enrollments/", {"course": course["id"]})
    print("ENROLLMENT ERROR:", res.data)
    assert res.status_code == 400
