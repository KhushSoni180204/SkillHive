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
from django.contrib import admin
from accounts.views import (
    AdminUserListAPIView, 
    AdminUserDetailAPIView,
    AdminUserToggleStatusAPIView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # User registration
    path("api/auth/", include("accounts.urls")),

    # Courses API
    path("api/", include("courses.urls")),

    # Enrollments API
    path("api/", include("enrollments.urls")),

    # Doubt-Sessions API
    path("api/doubt-sessions/", include("doubt_sessions.urls")),

    # Admin API
    path("api/admin/", include("courses.urls")),
    path("api/admin/users/", AdminUserListAPIView.as_view()),
    path("api/admin/users/<int:pk>/", AdminUserDetailAPIView.as_view()),
    path("api/admin/users/<int:pk>/toggle-status/", AdminUserToggleStatusAPIView.as_view()),

    # Ask AI & Quiz Genrator
    path("api/ai/", include("ai_learning.urls")), 

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


