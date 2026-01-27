import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from courses.models import Course
from enrollments.models import Enrollment

User = get_user_model()

@pytest.mark.django_db
def test_student_can_enroll(student_user, instructor_user):
    instructor_client = APIClient()
    instructor_client.force_authenticate(user=instructor_user)

    # Instructor creates course
    course_response = instructor_client.post(
        "/api/courses/",
        {
            "course_name": "Django",
            "description": "Backend"
        },
        format="json"
    )

    assert course_response.status_code == 201
    course_id = course_response.data["id"]

    student_client = APIClient()
    student_client.force_authenticate(user=student_user)

    # Student enrolls
    enroll_response = student_client.post(
        "/api/enrollments/",
        {"course_id": course_id},
        format="json"
    )

    assert enroll_response.status_code == 201
    assert Enrollment.objects.filter(
        user=student_user,
        course_id=course_id
    ).exists()


@pytest.mark.django_db
def test_duplicate_enrollment_not_allowed(student_user, instructor_user):
    # Instructor creates course
    instructor_client = APIClient()
    instructor_client.force_authenticate(user=instructor_user)

    course_response = instructor_client.post(
        "/api/courses/",
        {
            "course_name": "React",
            "description": "Frontend"
        },
        format="json"
    )

    assert course_response.status_code == 201
    course_id = course_response.data["id"]

    # Student enrolls first time
    student_client = APIClient()
    student_client.force_authenticate(user=student_user)

    first_enroll = student_client.post(
        "/api/enrollments/",
        {"course_id": course_id},
        format="json"
    )

    assert first_enroll.status_code == 201

    # Student enrolls second time (should fail)
    second_enroll = student_client.post(
        "/api/enrollments/",
        {"course_id": course_id},
        format="json"
    )

    assert second_enroll.status_code == 403

    # DB should still have only ONE enrollment
    assert Enrollment.objects.filter(
        user=student_user,
        course_id=course_id
    ).count() == 1