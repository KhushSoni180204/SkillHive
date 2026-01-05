from datetime import date
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from courses.models import Course
from enrollments.models import Enrollment
from .models import DoubtSession, DoubtSessionParticipant
from .serializers import DoubtSessionSerializer
from accounts.permissions import IsStudent
from rest_framework.permissions import IsAuthenticated

class JoinDoubtSessionAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, pk):
        student = request.user

        session = get_object_or_404(DoubtSession, pk=pk)

        # 1️⃣ Must be participant
        if not DoubtSessionParticipant.objects.filter(
            session=session,
            student=student
        ).exists():
            return Response(
                {"detail": "You are not a participant of this session"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2️⃣ Must be enrolled in the course
        if not Enrollment.objects.filter(
            user=student,
            course=session.course
        ).exists():
            return Response(
                {"detail": "You are not enrolled in this course"},
                status=status.HTTP_403_FORBIDDEN
            )

        # 3️⃣ Session must not be cancelled
        if session.status == "cancelled":
            return Response(
                {"detail": "This session has been cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4️⃣ Meet link visibility rules
        if session.status != "live":
            return Response(
                {
                    "status": session.status,
                    "can_join": False,
                    "detail": "Session is not live yet"
                },
                status=status.HTTP_200_OK
            )

        # 5️⃣ Live → allow join
        return Response(
            {
                "status": session.status,
                "can_join": True,
                "meet_link": session.meet_link,
            },
            status=status.HTTP_200_OK
        )

from django.db.models import Count

class MyDoubtSessionsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        sessions = (
            DoubtSession.objects
            .filter(participants__student=request.user)
            .annotate(participants_count=Count("participants"))
            .order_by("session_date", "start_time")
        )

        serializer = DoubtSessionSerializer(sessions, many=True)
        return Response(serializer.data)


from django.db.models import Count
from accounts.permissions import IsInstructor
from .models import DoubtSession
from .serializers import InstructorDoubtSessionSerializer

class InstructorDoubtSessionsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        sessions = (
            DoubtSession.objects
            .filter(instructor=request.user)
            .annotate(participants_count=Count("participants"))
            .order_by("session_date", "start_time")
        )

        serializer = InstructorDoubtSessionSerializer(sessions, many=True)
        return Response(serializer.data)


class UpdateMeetLinkAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def patch(self, request, pk):
        session = get_object_or_404(
            DoubtSession,
            pk=pk,
            instructor=request.user
        )

        meet_link = request.data.get("meet_link")
        if not meet_link:
            return Response(
                {"detail": "meet_link is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.meet_link = meet_link
        session.save(update_fields=["meet_link"])

        return Response(
            {"detail": "Meet link updated successfully"}
        )

class UpdateSessionStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    ALLOWED_TRANSITIONS = {
        "scheduled": ["live", "cancelled"],
        "live": ["completed"],
    }

    def patch(self, request, pk):
        session = get_object_or_404(
            DoubtSession,
            pk=pk,
            instructor=request.user
        )

        new_status = request.data.get("status")
        current_status = session.status

        if new_status not in self.ALLOWED_TRANSITIONS.get(current_status, []):
            return Response(
                {"detail": f"Cannot change status from {current_status} to {new_status}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.status = new_status
        session.save(update_fields=["status"])

        return Response(
            {"detail": f"Session marked as {new_status}"}
        )
