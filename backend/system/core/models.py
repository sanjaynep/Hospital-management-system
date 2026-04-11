from django.db import models
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager, PermissionsMixin
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, fullname, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            fullname=fullname,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, fullname, password=None):
        user = self.create_user(
            email=email,
            fullname=fullname,
            password=password,
            role='user'
        )
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ('user', 'User'),
        ('doctor', 'Doctor'),
    )

    Gender_Choices = (
        ('male','male'),
        ('female','female'),
        ('other','other')
    )

    SPECIALIZATION_CHOICES = [
        ("general_physician", "General Physician (MBBS, MD Internal Medicine)"),
        ("neuro_ortho", "Neuro-Ortho Specialist"),
        ("cardiologist", "Cardiologist (DM Cardiology)"),
        ("dermatology", "Dermato-Endocrine-Gyne Specialist (MD Dermatology)")
    ]


    email = models.EmailField(unique=True)
    fullname = models.CharField(max_length=255)
    profile = models.ImageField(upload_to="media", height_field=None, width_field=None, max_length=None,null=True,blank=True)
    gender = models.CharField(max_length=10, choices=Gender_Choices)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # Doctor-only fields
    contact = models.CharField(max_length=15, null=True, blank=True)
    specialization = models.CharField(max_length=255, null=True, choices=SPECIALIZATION_CHOICES,blank=True)
    license_no = models.CharField(max_length=100,unique=True, null=True,  blank=True)
    experience = models.PositiveIntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_admin = models.BooleanField(default = False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname']

    def __str__(self):
        return f"{self.email} ({self.role})"

class Appointment(models.Model):
    PRIORITY_CHOICES = [
        ('normal', 'Normal'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='patient_appointments', limit_choices_to={'role': 'user'}
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='doctor_appointments', limit_choices_to={'role': 'doctor'}
    )
    disease = models.CharField(max_length=255, blank=True, default='')
    symptoms = models.JSONField(default=list, blank=True)
    date = models.DateField()
    time_slot = models.CharField(max_length=20)          
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'time_slot']
        # prevent double-booking: same doctor, same date+slot
        unique_together = ['doctor', 'date', 'time_slot']

    def __str__(self):
        return f"{self.patient.fullname} → {self.doctor.fullname} on {self.date} {self.time_slot}"
