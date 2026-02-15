from django.contrib import admin

from django.contrib import admin
from core.models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'role','fullname','is_active','profile','gender','is_admin','is_staff','contact','specialization','license_no','experience','created_at', 'updated_at')
    list_filter = ('is_admin', 'is_active')
    search_fields = ('email', 'fullname')
    ordering = ('email',)
