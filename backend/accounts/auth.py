from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Login happens via email
    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["user_role"] = user.user_role
        token["username"] = user.username  
        token["email"] = user.email

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["email"] = self.user.email
        data["username"] = self.user.username
        data["user_role"] = self.user.user_role

        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
