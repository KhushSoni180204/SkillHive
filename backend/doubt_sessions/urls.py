from django.urls import path
from .views import (
    JoinDoubtSessionAPIView, MyDoubtSessionsAPIView, 
    InstructorDoubtSessionsAPIView, UpdateMeetLinkAPIView, 
    UpdateSessionStatusAPIView,JoinSessionInfoAPIView,
    GenerateZoomLinkAPIView
)

urlpatterns = [
    path("join/", JoinDoubtSessionAPIView.as_view()),
    path("my/", MyDoubtSessionsAPIView.as_view()),
    path("instructor/", InstructorDoubtSessionsAPIView.as_view()),
    path("<int:pk>/meet-link/", UpdateMeetLinkAPIView.as_view()),
    path("<int:pk>/status/", UpdateSessionStatusAPIView.as_view()),
    path("<int:pk>/join/", JoinSessionInfoAPIView.as_view()),
    path("<int:pk>/generate-zoom/", GenerateZoomLinkAPIView.as_view()),
]
