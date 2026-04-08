import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')

app = Celery('system')

# Load settings from Django settings file, using CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()
