from .models import Course, Module, Lesson
from enrollments.models import Enrollment, LessonProgress
from accounts.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .serializers import (
    CourseSerializer,
    ModuleSerializer,
    LessonSerializer,
    CourseDetailSerializer,
    ModuleDetailSerializer,
)
from accounts.permissions import IsInstructor, IsStudent, IsAdmin, IsStudentOrInstructor
from django.core.cache import cache
from courses.serializers import AdminCourseSerializer
from django.db.models import Count
from django.contrib.postgres.search import (
    SearchVector,
    SearchQuery,
    SearchRank
)

# ---------------------------------------------
# Searching Views
# ---------------------------------------------
class CourseSearchAPIView(APIView):
    def get(self, request):
        query = request.query_params.get("q")

        if not query:
            courses = Course.objects.filter(status="published")
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        search_vector = (
            SearchVector("course_name", weight="A") +
            SearchVector("description", weight="B") +
            SearchVector("instructor__username", weight="C")
        )

        search_query = SearchQuery(query)

        courses = (
            Course.objects
            .annotate(rank=SearchRank(search_vector, search_query))
            .filter(rank__gte=0.1, status="published")
            .order_by("-rank")
        )

        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# -------------------------------------------
# Admin views
# -------------------------------------------
class AdminCourseListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        courses = Course.objects.select_related("instructor").all()
        serializer = AdminCourseSerializer(courses, many=True)
        return Response(serializer.data)

class AdminCourseStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        course = Course.objects.get(pk=pk)

        course.status = (
            "draft" if course.status == "published" else "published"
        )
        course.save()

        cache.delete("course_list")
        cache.delete("admin_course_list")
        cache.delete(f"course_detail_{course.id}")

        return Response(
            {
                "id": course.id,
                "status": course.status
            },
            status=status.HTTP_200_OK
        )

class AdminCourseDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"},
                status=404
            )

        course.delete()

        cache.delete("course_list")
        cache.delete("admin_course_list")
        cache.delete(f"course_detail_{course.id}")
        return Response(
            {"message": "Course deleted successfully"},
            status=204
        )

# ------------------------------------------------------------
# COURSE LIST + CREATE
# ------------------------------------------------------------
class CourseListAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return [IsInstructor()]

    def get(self, request):

        cache_key = "course_list"

        data = cache.get(cache_key)
        if data:
            return Response(data, status=status.HTTP_200_OK)

        courses = Course.objects.filter(status="published")
        serializer = CourseSerializer(courses, many=True)

        data = serializer.data
        cache.set(cache_key, data, 60 * 5) # 5 minutes

        return Response(data, status=status.HTTP_200_OK)


    def post(self, request):
        data = request.data.copy()
        data["instructor"] = request.user.id

        serializer = CourseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

            cache.delete("course_list")

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# ------------------------------------------------------------
# Instructor Course List
# ------------------------------------------------------------
class InstructorCourseListAPIView(APIView):
    permission_classes = [IsInstructor]

    def get(self, request):
        courses = Course.objects.filter(instructor=request.user)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

# ------------------------------------------------------------
# COURSE DETAIL + UPDATE + DELETE
# ------------------------------------------------------------
class CourseDetailAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return [IsInstructor()]

    def get(self, request, pk):
        cache_key = f"course_detail_{pk}"
        data = cache.get(cache_key)
        if data:
            return Response(data, status=200)

        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        serializer = CourseDetailSerializer(course)
        data = serializer.data
        cache.set(cache_key, data, 60 * 5)
        return Response(data)

    def put(self, request, pk):
        try:
            course = Course.objects.get(pk=pk, instructor=request.user)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"course_detail_{pk}")
            cache.delete(f"course_full_detail_{pk}")
            cache.delete("course_list")
            return Response({"message": "Updated", "data": serializer.data})

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            course = Course.objects.get(pk=pk, instructor=request.user)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

        course.delete()
        cache.delete(f"course_detail_{pk}")
        cache.delete(f"course_full_detail_{pk}")
        cache.delete("course_list")
        return Response(status=204)

# ------------------------------------------------------------
# FULL NESTED COURSE DETAILS
# ------------------------------------------------------------
class CourseFullDetailAPIView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return [IsInstructor()] 
  
    def get(self, request, pk):

        cache_key = f"course_full_detail_{pk}"

        data = cache.get(cache_key)
        if data:
            return Response(data, status=status.HTTP_200_OK)
    
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({'error': "Course not found"}, status=404)

        serializer = CourseDetailSerializer(course)

        data = serializer.data

        cache.set(cache_key, data, 60 * 5) # for 5 minutes stored in cache memory

        return Response(data, status=status.HTTP_200_OK)

# ------------------------------------------------------------
# MODULE LIST + CREATE
# ------------------------------------------------------------
class ModuleListAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return []
        return [IsInstructor()] 

    def get(self, request):

        cache_key = "module_list"
        
        data = cache.get(cache_key)
        if data:
            return Response(data,status=status.HTTP_200_OK)

        modules = Module.objects.all()
        serializer = ModuleSerializer(modules, many=True)

        data = serializer.data
        cache.set(cache_key, data, 60 * 5) # 5 minutes in cache memeory

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ModuleSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            cache.delete("module_list")
            cache.delete(f"course_full_detail_{serializer.data['course']}")


            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ------------------------------------------------------
# Module Detail Update + Delete
# ------------------------------------------------------

class ModuleDetailAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsStudentOrInstructor()]
        return [IsInstructor()]

    def get(self, request, pk):
        module = get_object_or_404(Module, pk=pk)
        serializer = ModuleDetailSerializer(module)
        return Response(serializer.data)

    def put(self, request, pk):
        module = get_object_or_404(Module, pk=pk)

        if module.course.instructor != request.user:
            return Response({"error": "Forbidden"}, status=403)

        serializer = ModuleDetailSerializer(module, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"course_full_detail_{module.course.id}")
            return Response({"message": "Updated", "data": serializer.data})

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        module = get_object_or_404(Module, pk=pk)

        if module.course.instructor != request.user:
            return Response({"error": "Forbidden"}, status=403)

        module.delete()
        cache.delete(f"course_full_detail_{module.course.id}")
        return Response({"message": "Module deleted"}, status=204)

#-------------------------------------------------------------------------
# Module Progress View
#-------------------------------------------------------------------------

class ModuleProgressAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            module = Module.objects.get(pk=pk)
        except Module.DoesNotExist:
            return Response({"error": "Module not found"}, status=404)

        lessons = module.lessons.all()

        progress = LessonProgress.objects.filter(
            user=request.user,
            lesson__in=lessons,
            completed=True
        ).values_list("lesson_id", flat=True)

        completed_ids = set(progress)

        data = []
        for lesson in lessons:
            data.append({
                "id": lesson.id,
                "lesson_name": lesson.lesson_name,
                "duration": lesson.duration,
                "completed": lesson.id in completed_ids
            })

        return Response({
            "module_id": module.id,
            "module_name": module.module_name,
            "lessons": data
        })

# ------------------------------------------------------------
# LESSON LIST + CREATE
# ------------------------------------------------------------

class LessonListAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return []      
        return [IsInstructor()]

    def get(self, request):

        cache_key = "lesson_list"

        data = cache.get(cache_key)
        if data:
            return Response(data, status=status.HTTP_200_OK)

        lessons = Lesson.objects.all()
        serializer = LessonSerializer(lessons, many=True)

        data = serializer.data
        cache.set(cache_key, data, 60 * 5) # 5 minutes in cache memory

        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LessonSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            cache.delete("lesson_list")
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    
# ------------------------------------------------------------
# Lesson Detail + Update + Delete
# ------------------------------------------------------------

class LessonDetailAPIView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return []      
        return [IsInstructor()]

    def get(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"},status=status.HTTP_404_NOT_FOUND)
        
        serializer = LessonSerializer(lesson)
        return Response(serializer.data)
    
    def put(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"},status=status.HTTP_404_NOT_FOUND)
        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            cache.delete(f"course_full_detail_{lesson.module.course.id}")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            lesson = Lesson.objects.get(pk=pk)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"},status=status.HTTP_404_NOT_FOUND)
        cache.delete(f"course_full_detail_{lesson.module.course.id}")
        lesson.delete()
        return Response(status=204)

# ----------------------------------------------------
#  Analysis Views
# ----------------------------------------------------
class AdminAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        total_users = User.objects.count()
        total_students = User.objects.filter(user_role="student").count()
        total_instructors = User.objects.filter(user_role="instructor").count()

        total_courses = Course.objects.count()
        published_courses = Course.objects.filter(status="published").count()
        draft_courses = Course.objects.filter(status="draft").count()

        total_enrollments = Enrollment.objects.count()

        # Course enrollments
        course_enrollments = (
            Enrollment.objects
            .values("course__id", "course__course_name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        most_enrolled = course_enrollments.first()
        least_enrolled = course_enrollments.last()

        # Average progress
        progress = LessonProgress.objects.filter(completed=True).count()
        total_lessons = Lesson.objects.count()
        avg_completion = (
            round((progress / total_lessons) * 100)
            if total_lessons > 0 else 0
        )

        return Response({
            "users": {
                "total": total_users,
                "students": total_students,
                "instructors": total_instructors,
            },
            "courses": {
                "total": total_courses,
                "published": published_courses,
                "draft": draft_courses,
            },
            "enrollments": total_enrollments,
            "completion_rate": avg_completion,
            "most_enrolled_course": most_enrolled,
            "least_enrolled_course": least_enrolled,
        })
    
class InstructorAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        instructor = request.user
        courses = Course.objects.filter(instructor=instructor)

        data = []

        for course in courses:
            enrollments = Enrollment.objects.filter(course=course)
            total_students = enrollments.count()

            total_lessons = Lesson.objects.filter(
                module__course=course
            ).count()

            completed_students = 0
            progress_sum = 0

            for enroll in enrollments:
                completed = LessonProgress.objects.filter(
                    user=enroll.user,
                    lesson__module__course=course,
                    completed=True
                ).count()

                if total_lessons > 0:
                    percent = (completed / total_lessons) * 100
                else:
                    percent = 0

                progress_sum += percent

                if completed == total_lessons and total_lessons > 0:
                    completed_students += 1

            avg_progress = (
                round(progress_sum / total_students)
                if total_students > 0 else 0
            )

            completion_rate = (
                round((completed_students / total_students) * 100)
                if total_students > 0 else 0
            )

            data.append({
                "course_id": course.id,
                "course_name": course.course_name,
                "total_enrollments": total_students,
                "completed_students": completed_students,
                "average_progress": avg_progress,
                "completion_rate": completion_rate,
            })

        return Response(data)
