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
    


# class Enrollment(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
#     course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
#     enrolled_at = models.DateTimeField(auto_now_add=True)

#     STATUS_CHOICES = (
#         ('not_started', 'Not Started'),
#         ('in_progress', 'In Progress'),
#         ('complete', 'Complete'),
#     )
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')

#     def __str__(self):
#         return f"{self.user.username} → {self.course.course_name}"
    
    

# class LessonProgress(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lesson_progress")
#     lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress")
#     completed = models.BooleanField(default=False)
#     completed_at = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         unique_together = ("user", "lesson")

#     def __str__(self):
#         return f"{self.user.username} - {self.lesson.lesson_name}"
