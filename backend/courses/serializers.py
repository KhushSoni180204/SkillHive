from rest_framework import serializers
from .models import Course, Module, Lesson
from accounts.models import User


# --------------------------------------------------
#  SIMPLE SERIALIZERS
# --------------------------------------------------

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = "__all__"


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = "__all__"


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


# --------------------------------------------------
#  NESTED SERIALIZERS
# --------------------------------------------------

class ModuleDetailSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "module_name", "module_order", "summary", "lessons"]


class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ["id", "course_name", "description", "status", "modules"]


class AdminInstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class AdminCourseSerializer(serializers.ModelSerializer):
    instructor = AdminInstructorSerializer(read_only=True)
    instructor_username = serializers.CharField(
        source="instructor.username",
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "course_name",
            "status",
            "created_at",
            "instructor",
        ]

