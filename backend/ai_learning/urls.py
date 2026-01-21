from django.urls import path
from .views import AskAIAPIView, GenerateQuizAPIView

urlpatterns = [
    path("ask/", AskAIAPIView.as_view()),
    path("generate-quiz/", GenerateQuizAPIView.as_view()),
]
