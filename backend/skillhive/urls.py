"""
URL configuration for skillhive project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import RegisterAPIView
from accounts.auth import CustomTokenObtainPairView
from django.contrib import admin
from django.urls import path, include
from accounts.views import (
RegisterAPIView, 
CustomTokenObtainPairView, 
AdminUserListAPIView, 
AdminUserDetailAPIView, AdminUserToggleStatusAPIView,
# LoginAPIView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # User registration
    path("api/auth/register/", RegisterAPIView.as_view()),

    # JWT login + refresh
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="jwt_login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="jwt_refresh"),

    # Courses API
    path("api/", include("courses.urls")),

    # Admin API
    path("api/admin/", include("courses.urls")),
    path("api/admin/users/", AdminUserListAPIView.as_view()),
    path("api/admin/users/<int:pk>/", AdminUserDetailAPIView.as_view()),
    path("api/admin/users/<int:pk>/toggle-status/", AdminUserToggleStatusAPIView.as_view()),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


