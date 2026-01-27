import pytest
from unittest.mock import patch
from rest_framework import status
from ai_learning.models import AIQuiz

@pytest.mark.django_db
@patch("ai_learning.views.GeminiService.generate")
def test_existing_quiz_is_reused(
    mock_generate,
    api_client,
    student_user,
    sample_lesson,
    enrollment
):
    # Arrange
    api_client.force_authenticate(user=student_user)

    existing_quiz_data = {
        "questions": [
            {"question": "What is a model?", "answer": "DB table"}
        ]
    }

    AIQuiz.objects.create(
        student=student_user,
        lesson=sample_lesson,
        difficulty="easy",
        quiz_data=existing_quiz_data
    )

    url = "/api/ai/generate-quiz/"

    payload = {
        "lesson_id": sample_lesson.id,
        "difficulty": "easy"
    }

    # Act
    response = api_client.post(url, payload, format="json")

    # Assert
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == existing_quiz_data

    # MOST IMPORTANT ASSERTION
    mock_generate.assert_not_called()
