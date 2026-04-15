from celery import shared_task
from datetime import timedelta
from django.utils import timezone
from .models import Appointment
import logging

logger = logging.getLogger(__name__)

@shared_task
def auto_cancel_pending_appointments():
    try:
        cutoff = timezone.now() - timedelta(seconds=30)
        logger.info(f"Cutoff time: {cutoff}")
        
        appointments = list(Appointment.objects.filter(
            status="pending",
            created_at__lt=cutoff
        ))
        
        logger.info(f"Found {len(appointments)} pending appointments to cancel")
        
        if appointments:
            for appt in appointments:
                logger.info(f"Cancelling appointment {appt.id}")
                appt.status = "cancelled"
            
            Appointment.objects.bulk_update(appointments, ['status'], batch_size=100)
            logger.info(f"Successfully cancelled {len(appointments)} appointments")
        else:
            logger.info("No pending appointments found to cancel")
    
    except Exception as e:
        logger.error(f"Error in auto_cancel_pending_appointments: {str(e)}", exc_info=True)
