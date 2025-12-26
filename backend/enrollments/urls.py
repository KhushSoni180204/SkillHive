from django.urls import path
from .views import EnrollmentListAPIView, LessonProgressAPIView

urlpatterns = [
    # For Enrollment
    path("enrollments/", EnrollmentListAPIView.as_view()),

    # For lesson-progress
    path("lesson-progress/", LessonProgressAPIView.as_view()),
]