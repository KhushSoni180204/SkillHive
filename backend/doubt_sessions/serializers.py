from rest_framework import serializers
from .models import DoubtSession

class DoubtSessionSerializer(serializers.ModelSerializer):
    participants_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = DoubtSession
        fields = [
            "id",
            "course",
            "session_date",
            "start_time",
            "end_time",
            "status",
            "participants_count",
        ]

class InstructorDoubtSessionSerializer(serializers.ModelSerializer):
    participants_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = DoubtSession
        fields = [
            "id",
            "course",
            "session_date",
            "start_time",
            "end_time",
            "status",
            "meet_link",
            "participants_count",
        ]
