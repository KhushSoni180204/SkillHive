from django.urls import path
from .views import register_user, login_user, RegisterAPIView, LoginAPIView

urlpatterns = [
    # path("register/", register_user, name="register"),
    # path("", login_user, name="login"),

    # path("login/", LoginAPIView.as_view()),
    # path("signup/", RegisterAPIView.as_view()),

]
