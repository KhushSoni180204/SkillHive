def ask_ai_prompt(course, lesson, question):
    return f""" 

You are an intelligent teaching assistant.

Course:{course.course_name}
Lesson:{lesson.lesson_name}

Lesson Content:
{lesson.content}

Student Question:
{question}

Explain clearly, step-by-step,
Use example if needed
DO NOT answer outside this lesson context.
"""

def quiz_prompt(lesson, difficulty):
    return f"""
You are an expert educator.

Lesson Content:
{lesson.content}

Generate a {difficulty} level quiz with:
- 5 MCQs
- 4 options each
- correct answer
- explanation

Return ONLY valid JSON in this format:
{{
  "questions": [
    {{
      "question": "",
      "options": [],
      "answer": "",
      "explanation": ""
    }}
  ]
}}
"""
