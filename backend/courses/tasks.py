from celery import shared_task
from django.utils import timezone

@shared_task(bind=True)
def lesson_video_processed(self, lesson_id):
    print(f"[CELERY] Processing video for lesson {lesson_id} at {timezone.now()}")
    return {"lesson_id": lesson_id, "status": "done"}
