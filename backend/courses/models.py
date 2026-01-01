from django.db import models
from django.db import models
from accounts.models import User

class Course(models.Model):
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)
    course_name = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return self.course_name


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    module_name = models.CharField(max_length=255)
    module_order = models.PositiveIntegerField()
    summary = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["module_order"]

    def __str__(self):
        return f"{self.module_order}. {self.module_name}"


class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    lesson_name = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    video_file = models.FileField(upload_to="videos/", blank=True, null=True)
    attachment = models.FileField(upload_to="lesson_files/", blank=True, null=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def embed_url(self):

        if not self.video_url:
            return None

        url = self.video_url.strip()

        if "youtube.com/embed/" in url:
            return url.split("?")[0]

        if "watch?v=" in url:
            video_id = url.split("watch?v=")[-1]
            video_id = video_id.split("&")[0]
            return f"https://www.youtube.com/embed/{video_id}"

        if "youtu.be/" in url:
            video_id = url.split("youtu.be/")[-1]
            video_id = video_id.split("?")[0]
            return f"https://www.youtube.com/embed/{video_id}"

        return None

    def __str__(self):
        return self.lesson_name
    