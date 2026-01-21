from django.db import models
from accounts.models import User
from courses.models import Course, Lesson

class AIQuestion(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True)
    
    question = models.TextField()
    ai_answer = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class AIQuiz(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)

    quiz_data = models.JSONField() 
    difficulty = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)
