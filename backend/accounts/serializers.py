from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password
from skillhive import settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "user_role",
            "user_phone",
            "is_active",
        ]

class AdminRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    secret_key = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username","email","password","secret_key"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_admin_key(self, value):
        if value != settings.ADMIN_SECRET_KEY:
            raise serializers.ValidationError("Invalid admin key")
        return value

    def create(self, validated_data):
        validated_data.pop("secret_key")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            user_role="admin",
            is_active=True,
        )
        return user
