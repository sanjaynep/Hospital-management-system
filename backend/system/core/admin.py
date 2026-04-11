from django.contrib import admin
from core.models import User, Appointment

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role','fullname','is_active','profile','gender','is_admin','is_staff','contact','specialization','license_no','experience','created_at', 'updated_at')
    list_filter = ('is_admin', 'is_active')
    search_fields = ('email', 'fullname')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'disease', 'date', 'time_slot', 'priority', 'status', 'created_at')
    list_filter = ('status', 'priority', 'date')
    search_fields = ('patient__fullname', 'doctor__fullname', 'disease')
