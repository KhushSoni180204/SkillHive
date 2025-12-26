from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rest_framework import status
from django.core.cache import cache

from .models import Enrollment, LessonProgress
from .serializers import EnrollmentSerializer, LessonProgressSerializer
from courses.models import Course
from accounts.permissions import IsStudent


# Create your views here.

# ------------------------------------------------------------
# ENROLLMENT LIST + CREATE (STUDENTS ONLY)
# ------------------------------------------------------------

class EnrollmentListAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]      
        return [IsStudent()]
    
    def get(self, request):
        
        cache_key = f"enrollment_list_{request.user.id}"

        data = cache.get(cache_key)
        if data:
            return Response(data, status=status.HTTP_200_OK)

        enrollment = Enrollment.objects.filter(user=request.user)
        serializer = EnrollmentSerializer(enrollment, many=True)

        data = serializer.data
        cache.set(cache_key, data, 60 * 5) # 5 minutes stored in cache memory

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id

        # Accept both "course" and "course_id"
        course_id = data.get("course") or data.get("course_id")

        if not course_id:
            return Response({"error": "course is required"}, status=400)

        # Fix duplicate check
        if Enrollment.objects.filter(user=request.user, course=course_id).exists():
            return Response({"error": "Already enrolled"}, status=status.HTTP_403_FORBIDDEN)

        # Normalize field for serializer
        data["course_id"] = course_id

        serializer = EnrollmentSerializer(data=data) 

        if serializer.is_valid():
            serializer.save()

            cache.delete(f"enrollment_list_{request.user.id}")

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
#---------------------------------------------------------
# LessonProgress
#---------------------------------------------------------

class LessonProgressAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress = LessonProgress.objects.filter(user=request.user)
        serializer = LessonProgressSerializer(progress, many=True)
        return Response(serializer.data, status=200)

    def post(self, request):
        lesson_id = request.data.get("lesson_id")

        if not lesson_id:
            return Response({"error": "lesson_id is required"}, status=400)

        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson_id=lesson_id
        )

        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()

        serializer = LessonProgressSerializer(progress)
        return Response(serializer.data, status=200)
