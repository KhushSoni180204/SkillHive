from django.urls import path
from .views import AdminRegisterAPIView, RegisterAPIView
from .auth import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/register/", AdminRegisterAPIView.as_view()),
    path("refresh/", TokenRefreshView.as_view(), name="jwt_refresh"),
    path("login/", CustomTokenObtainPairView.as_view(), name="jwt_login"),
    path("register/", RegisterAPIView.as_view()),
]
