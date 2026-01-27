from ai_learning.services.prompt_builder import ask_ai_prompt
from types import SimpleNamespace

def test_ask_ai_prompt():
    course = SimpleNamespace(
        course_name = "AWS"
    )
    lesson = SimpleNamespace(
        lesson_name = "Introduction to AWS",
        content = "Basic intoduction on services"
    )

    prompt = ask_ai_prompt(
        course=course,
        lesson=lesson,
        question = "What is S3 storage"
    )

    assert isinstance(prompt, str)