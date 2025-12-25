from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from accounts.serializers import CustomJWTSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from accounts.models import User
from accounts.serializers import AdminUserSerializer
from django.shortcuts import get_object_or_404

class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        students = User.objects.filter(user_role="student")
        instructors = User.objects.filter(user_role="instructor")

        return Response({
            "students": AdminUserSerializer(students, many=True).data,
            "instructors": AdminUserSerializer(instructors, many=True).data,
        })


class AdminUserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_superuser:
            return Response(
                {"error": "Cannot delete superuser"},
                status=status.HTTP_403_FORBIDDEN
            )

        user.delete()
        return Response(
            {"message": "User deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

class AdminUserToggleStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        user = User.objects.get(pk=pk)

        # Prevent admin from disabling themselves
        if user == request.user:
            return Response(
                {"error": "You cannot deactivate your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        return Response({
            "id": user.id,
            "username": user.username,
            "is_active": user.is_active
        }, status=status.HTTP_200_OK)

class RegisterAPIView(APIView):

    def post(self, request):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "user_role": user.user_role,
                    "user_phone": user.user_phone,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomJWTSerializer    

# from rest_framework_simplejwt.views import TokenObtainPairView
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework.exceptions import AuthenticationFailed

# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
#     def validate(self, attrs):
#         data = super().validate(attrs)

#         if not self.user.is_active:
#             raise AuthenticationFailed(
#                 "Your account has been disabled by admin."
#             )

#         return data


# class LoginAPIView(TokenObtainPairView):
#     serializer_class = CustomTokenObtainPairSerializer

