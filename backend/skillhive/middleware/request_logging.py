import os
import time
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication

LOG_FILE = os.path.join(settings.BASE_DIR, "logs", "request_logs.txt")

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()

        # Ensure logs directory exists
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

    def __call__(self, request):
        start = time.time()

        # Authenticate JWT
        try:
            auth_tuple = self.jwt_auth.authenticate(request)
            if auth_tuple:
                request.user = auth_tuple[0]
        except Exception:
            request.user = AnonymousUser()

        response = self.get_response(request)

        method = request.method
        path = request.path
        status = response.status_code
        duration = (time.time() - start) * 1000
        user = request.user.username if request.user.is_authenticated else "Anonymous"
        ip = request.META.get("REMOTE_ADDR")

        with open(LOG_FILE, "a") as f:
            f.write(f"{method} {path} | {status} | User={user} | IP={ip} | {duration:.2f}ms\n")

        return response
