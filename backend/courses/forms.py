from django import forms
from .models import Course, Module, Lesson

class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ["course_name", "description", "status"]


class ModuleForm(forms.ModelForm):
    class Meta:
        model = Module
        fields = ["module_name", "module_order", "summary"]


class LessonForm(forms.ModelForm):
    class Meta:
        model = Lesson
        fields = ["lesson_name", "content", "video_file", "attachment", "duration"]

