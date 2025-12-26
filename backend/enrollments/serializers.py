from rest_framework import serializers
from .models import Course, Enrollment, LessonProgress
from courses.serializers import CourseDetailSerializer

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseDetailSerializer(read_only=True)  # Use nested serializer
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True
    )

    class Meta:
        model = Enrollment
        fields = "__all__"

    extra_kwargs = {
        "user": {"read_only": True}
    }


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = "__all__"
        extra_kwargs = {
            "user": {"read_only": True}
        }