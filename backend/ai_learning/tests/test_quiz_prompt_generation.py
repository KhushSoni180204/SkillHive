from types import SimpleNamespace
from ai_learning.services.prompt_builder import quiz_prompt

def test_generate_quiz_prompt_returns_string():
    
    lesson = SimpleNamespace(
        content = "Django models define database structure"
    )
    
    prompt = quiz_prompt(
        lesson=lesson,
        difficulty="easy"
    )

    assert isinstance(prompt, str)
