import multiprocessing

# Number of worker processes
workers = multiprocessing.cpu_count() * 2 + 1

# Type of worker
worker_class = "sync"

# Bind to address (Docker / Linux will use this)
bind = "0.0.0.0:8000"

# Django WSGI application
wsgi_app = "skillhive.wsgi:application"

# Logging
accesslog = "-"
errorlog = "-"

# Timeouts
timeout = 120
graceful_timeout = 30
keepalive = 5

# Security
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190