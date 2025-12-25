import time
from django.http import JsonResponse

FAILED_ATTEMPTS = {}  # { ip: {count: x, timestamp: y} }

MAX_ATTEMPTS = 3
BLOCK_TIME = 600  # 10 minutes


class IPThrottleMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        ip = request.META.get("REMOTE_ADDR")
        path = request.path

        # Only protect login path
        if path == "/api/auth/login/" and request.method == "POST":

            record = FAILED_ATTEMPTS.get(ip, {"count": 0, "timestamp": 0})
            now = time.time()

            # If already blocked
            if record["count"] >= MAX_ATTEMPTS:
                if now - record["timestamp"] < BLOCK_TIME:

                    response = JsonResponse(
                        {"error": "Too many failed attempts. Try again in 10 minutes."},
                        status=429
                    )

                    response["Access-Control-Allow-Origin"] = "*"
                    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
                    response["Access-Control-Allow-Methods"] = "POST, OPTIONS"

                    return response

                else:
                    FAILED_ATTEMPTS[ip] = {"count": 0, "timestamp": 0}

        response = self.get_response(request)

        if path == "/api/auth/login/" and response.status_code == 401:
            record = FAILED_ATTEMPTS.get(ip, {"count": 0, "timestamp": 0})
            record["count"] += 1
            record["timestamp"] = time.time()
            FAILED_ATTEMPTS[ip] = record
            print(f"FAILED LOGIN COUNT ({ip}) →", record["count"])

        if path == "/api/auth/login/" and response.status_code == 200:
            FAILED_ATTEMPTS[ip] = {"count": 0, "timestamp": 0}

        return response
