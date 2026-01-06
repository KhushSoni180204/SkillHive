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
from accounts.permissions import IsStudent, IsInstructor
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .zoom import create_zoom_meeting


class GenerateZoomLinkAPIView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def post(self, request, pk):
        session = get_object_or_404(
            DoubtSession,
            pk=pk,
            instructor=request.user
        )

        if session.status != "scheduled":
            return Response(
                {"detail": "Zoom link can only be generated for scheduled sessions"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if session.meet_link:
            return Response(
                {"detail": "Meet link already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build meeting time
        # Combine session_date + start_time
        start_dt = timezone.make_aware(
            timezone.datetime.combine(session.session_date, session.start_time)
        )

        topic = f"Doubt Session - {session.course.course_name}"

        try:
            join_url = create_zoom_meeting(
                topic=topic,
                start_time=start_dt,
                duration_minutes=60
            )
        except Exception as e:
            return Response(
                {
                    "detail": "Failed to generate Zoom meeting",
                    "error": str(e)   # 👈 ADD THIS
                },
                status=status.HTTP_502_BAD_GATEWAY
            )


        session.meet_link = join_url
        session.save(update_fields=["meet_link"])

        return Response(
            {
                "detail": "Zoom meeting created successfully",
                "meet_link": join_url
            },
            status=status.HTTP_201_CREATED
        )


class JoinDoubtSessionAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    @transaction.atomic
    def post(self, request):
        student = request.user

        course_id = request.data.get("course_id")
        session_date = request.data.get("session_date")

        if not course_id or not session_date:
            return Response(
                {"detail": "course_id and session_date are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        course = get_object_or_404(Course, id=course_id)

        # Must be enrolled
        if not Enrollment.objects.filter(
            user=student, course=course
        ).exists():
            return Response(
                {"detail": "You are not enrolled in this course"},
                status=status.HTTP_403_FORBIDDEN
            )

        session, created = DoubtSession.objects.get_or_create(
            course=course,
            session_date=session_date,
            defaults={
                "instructor": course.instructor,
                "start_time": "18:00",
                "end_time": "19:00",
            }
        )

        DoubtSessionParticipant.objects.get_or_create(
            session=session,
            student=student
        )

        serializer = DoubtSessionSerializer(session)

        return Response(
            {
                "created": created,
                "session": serializer.data
            },
            status=status.HTTP_201_CREATED
        )



class JoinSessionInfoAPIView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, pk):
        student = request.user
        session = get_object_or_404(DoubtSession, pk=pk)

        if not DoubtSessionParticipant.objects.filter(
            session=session,
            student=student
        ).exists():
            return Response(
                {"detail": "You are not a participant of this session"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not Enrollment.objects.filter(
            user=student,
            course=session.course
        ).exists():
            return Response(
                {"detail": "You are not enrolled in this course"},
                status=status.HTTP_403_FORBIDDEN
            )

        if session.status == "cancelled":
            return Response(
                {"detail": "This session has been cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if session.status != "live":
            return Response(
                {
                    "status": session.status,
                    "can_join": False,
                    "detail": "Session is not live yet"
                },
                status=status.HTTP_200_OK
            )

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
            .filter(participants__student=request.user, status__in=["scheduled","live","cancelled"])
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
