from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import json

from courses.models import Lesson
from enrollments.models import Enrollment
from .models import AIQuestion
from .services.gemini_client import GeminiService
from .services.prompt_builder import ask_ai_prompt


class AskAIAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get("lesson_id")
        question = request.data.get("question")

        lesson = (
            Lesson.objects
            .select_related("module", "module__course")
            .get(id=lesson_id)
        )

        course = lesson.module.course  

        if not Enrollment.objects.filter(
            user=request.user,
            course=course
        ).exists():
            return Response({"detail": "Not enrolled"}, status=403)

        prompt = ask_ai_prompt(course, lesson, question)
        answer = GeminiService.generate(prompt)

        AIQuestion.objects.create(
            student=request.user,
            course=course,
            lesson=lesson,
            question=question,
            ai_answer=answer
        )

        return Response({"answer": answer})

    
from .services.prompt_builder import quiz_prompt
from .models import AIQuiz


class GenerateQuizAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get("lesson_id")
        difficulty = request.data.get("difficulty","medium")

        lesson = (
            Lesson.objects
            .select_related("module", "module__course")
            .get(id=lesson_id)
        )
        prompt = quiz_prompt(lesson, difficulty)
        raw_response = GeminiService.generate(prompt)

        try:
            quiz_json = json.loads(raw_response)
        except json.JSONDecodeError:
            return Response({"error": "Invalid AI response"}, status=500)

        quiz = AIQuiz.objects.create(
            student=request.user,
            lesson=lesson,
            difficulty=difficulty,
            quiz_data=quiz_json
        )

        return Response(quiz.quiz_data)