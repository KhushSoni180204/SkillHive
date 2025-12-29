from django.urls import path
from .views import(
    CourseListAPIView, CourseDetailAPIView, ModuleListAPIView, 
    LessonListAPIView, CourseFullDetailAPIView, ModuleDetailAPIView, 
    LessonDetailAPIView, ModuleProgressAPIView, 
    InstructorCourseListAPIView, InstructorAnalyticsAPIView,
    AdminCourseStatusAPIView, AdminCourseListAPIView, AdminCourseDeleteAPIView,
    AdminAnalyticsAPIView, CourseSearchAPIView
)


urlpatterns = [
    # For courses
    path("courses/", CourseListAPIView.as_view()),
    path("courses/<int:pk>/", CourseDetailAPIView.as_view()),
    path("courses/<int:pk>/full/", CourseFullDetailAPIView.as_view()),
    path("instructor/courses/", InstructorCourseListAPIView.as_view()),

    # For Modules
    path("modules/", ModuleListAPIView.as_view()),
    path("modules/<int:pk>/", ModuleDetailAPIView.as_view()),
    path("modules/<int:pk>/progress/", ModuleProgressAPIView.as_view()),

    # For Lesson
    path("lessons/", LessonListAPIView.as_view()),
    path("lessons/<int:pk>/", LessonDetailAPIView.as_view()),

    # For Instructor Analytics
    path("instructor/analytics/", InstructorAnalyticsAPIView.as_view()),    

    # For Admin
    path("courses/", AdminCourseListAPIView.as_view()),
    path("courses/<int:pk>/toggle-status/", AdminCourseStatusAPIView.as_view()),
    path("courses/<int:pk>/delete/", AdminCourseDeleteAPIView.as_view()),
    path("analytics/",AdminAnalyticsAPIView.as_view()),

    # For Searching
    path("courses/search/", CourseSearchAPIView.as_view()),

]
