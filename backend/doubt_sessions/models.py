# doubt_sessions/models.py
from django.db import models
from django.utils import timezone
from accounts.models import User
from courses.models import Course

class DoubtSession(models.Model):

    STATUS_CHOICES = (
        ("scheduled", "Scheduled"),
        ("live", "Live"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="doubt_sessions"
    )

    # instructor is derived from course, but stored for fast access
    instructor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="instructor_sessions"
    )

    session_date = models.DateField()

    start_time = models.TimeField()
    end_time = models.TimeField()

    meet_link = models.URLField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="scheduled"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("course", "session_date")
        ordering = ["session_date", "start_time"]

    def __str__(self):
        return f"{self.course.course_name} | {self.session_date}"


class DoubtSessionParticipant(models.Model):
    session = models.ForeignKey(
        DoubtSession,
        on_delete=models.CASCADE,
        related_name="participants"
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="joined_doubt_sessions"
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("session", "student")

    def __str__(self):
        return f"{self.student.username} → {self.session}"
