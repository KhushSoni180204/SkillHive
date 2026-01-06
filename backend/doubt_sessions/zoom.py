import base64
import requests
from django.conf import settings
from datetime import datetime, timedelta, timezone


ZOOM_OAUTH_URL = "https://zoom.us/oauth/token"
ZOOM_API_BASE = "https://api.zoom.us/v2"


def get_zoom_access_token():
    if not all([
        settings.ZOOM_ACCOUNT_ID,
        settings.ZOOM_CLIENT_ID,
        settings.ZOOM_CLIENT_SECRET
    ]):
        raise RuntimeError("Zoom credentials missing in environment")

    credentials = f"{settings.ZOOM_CLIENT_ID}:{settings.ZOOM_CLIENT_SECRET}"
    encoded = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    data = {
        "grant_type": "account_credentials",
        "account_id": settings.ZOOM_ACCOUNT_ID,
    }

    res = requests.post(
        ZOOM_OAUTH_URL,
        headers=headers,
        data=data,
        timeout=10,
    )

    if res.status_code != 200:
        print("ZOOM TOKEN ERROR:", res.status_code, res.text)
        res.raise_for_status()

    return res.json()["access_token"]



def create_zoom_meeting(topic, start_time, duration_minutes=60):
    access_token = get_zoom_access_token()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "topic": topic,
        "type": 2,
        "start_time": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "duration": duration_minutes,
        "settings": {
            "join_before_host": False,
            "waiting_room": True,
            "approval_type": 0,
            "mute_upon_entry": True,
        },
    }

    res = requests.post(
        f"{ZOOM_API_BASE}/users/me/meetings",
        headers=headers,
        json=payload,
        timeout=10,
    )

    if res.status_code != 201:
        print("ZOOM MEETING ERROR:", res.status_code, res.text)
        res.raise_for_status()

    return res.json()["join_url"]

