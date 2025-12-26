from django.urls import path
from .views import AdminRegisterAPIView, CustomTokenObtainPairView, RegisterAPIView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/register/", AdminRegisterAPIView.as_view()),
    path("refresh/", TokenRefreshView.as_view(), name="jwt_refresh"),
    path("login/", CustomTokenObtainPairView.as_view(), name="jwt_login"),
    path("register/", RegisterAPIView.as_view()),
]
