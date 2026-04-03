from django.test import TestCase
from django.core.exceptions import ValidationError
from core.models import User, Appointment
from django.db import IntegrityError
from django.utils import timezone

# ========== USER MODEL TESTS ==========
class UserModelCreationTest(TestCase):
    """Tests for User model creation with proper defaults"""

    def test_user_creation_with_defaults(self):
        """Test that a user is created successfully with default values"""
        user = User.objects.create(
            email="testuser@example.com",
            fullname="Test User",
            gender="male",
            role="user"
        )
        
        self.assertEqual(user.email, "testuser@example.com")
        self.assertEqual(user.fullname, "Test User")
        self.assertEqual(user.gender, "male")
        self.assertEqual(user.role, "user")
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_admin)

    def test_user_str_representation(self):
        """Test the string representation of the user"""
        user = User.objects.create(
            email="patient@example.com",
            fullname="Patient Name",
            gender="female",
            role="user"
        )
        
        self.assertEqual(str(user), "patient@example.com (user)")

    def test_doctor_creation_with_license(self):
        """Test that a doctor user is created with license number"""
        doctor = User.objects.create(
            email="doctor@example.com",
            fullname="Dr. Smith",
            gender="male",
            role="doctor",
            license_no="LIC12345",
            specialization="general_physician"
        )
        
        self.assertEqual(doctor.role, "doctor")
        self.assertEqual(doctor.license_no, "LIC12345")
        self.assertEqual(doctor.specialization, "general_physician")


class UserModelUniqueConstraintsTest(TestCase):
    """Tests for User model unique constraints"""

    def test_email_uniqueness_constraint(self):
        """Test that duplicate emails raise IntegrityError"""
        User.objects.create(
            email="duplicate@example.com",
            fullname="User One",
            gender="male",
            role="user"
        )
        
        with self.assertRaises(IntegrityError):
            User.objects.create(
                email="duplicate@example.com",
                fullname="User Two",
                gender="female",
                role="doctor"
            )

    def test_doctor_license_uniqueness_constraint(self):
        """Test that duplicate license numbers raise IntegrityError for doctors"""
        User.objects.create(
            email="doc1@example.com",
            fullname="Doctor One",
            gender="female",
            role="doctor",
            license_no="LIC123"
        )
        
        with self.assertRaises(IntegrityError):
            User.objects.create(
                email="doc2@example.com",
                fullname="Doctor Two",
                gender="male",
                role="doctor",
                license_no="LIC123"
            )

    def test_different_doctors_different_licenses(self):
        """Test that different doctors can exist with different licenses"""
        doctor1 = User.objects.create(
            email="doc1@example.com",
            fullname="Doctor One",
            gender="female",
            role="doctor",
            license_no="LIC001"
        )
        
        doctor2 = User.objects.create(
            email="doc2@example.com",
            fullname="Doctor Two",
            gender="male",
            role="doctor",
            license_no="LIC002"
        )
        
        self.assertEqual(User.objects.filter(role="doctor").count(), 2)
        self.assertNotEqual(doctor1.license_no, doctor2.license_no)


class UserModelValidationTest(TestCase):
    """Tests for User model field validation"""

    def test_invalid_role_validation(self):
        """Test that invalid role raises ValidationError"""
        user = User(
            email="test@example.com",
            fullname="Test User",
            gender="male",
            role="invalid_role"
        )
        
        with self.assertRaises(ValidationError) as context:
            user.full_clean()
        
        self.assertIn('role', context.exception.error_dict)

    def test_invalid_gender_validation(self):
        """Test that invalid gender raises ValidationError"""
        user = User(
            email="test@example.com",
            fullname="Test User",
            gender="unknown",
            role="user"
        )
        
        with self.assertRaises(ValidationError) as context:
            user.full_clean()
        
        self.assertIn('gender', context.exception.error_dict)

    def test_valid_gender_choices(self):
        """Test all valid gender choices"""
        valid_genders = ['male', 'female', 'other']
        
        for i, gender in enumerate(valid_genders):
            user = User.objects.create_user(
                email=f"user{i}@example.com",
                fullname=f"User {i}",
                gender=gender,
                role="user",
                password="testpass123"
            )
            
            # Verify the gender was set correctly
            self.assertEqual(user.gender, gender)
        
        self.assertEqual(User.objects.count(), 3)

    def test_valid_role_choices(self):
        """Test all valid role choices"""
        valid_roles = ['user', 'doctor']
        
        for i, role in enumerate(valid_roles):
            user = User.objects.create_user(
                email=f"person{i}@example.com",
                fullname=f"Person {i}",
                gender="male",
                role=role,
                password="testpass123"
            )
            
            # Verify the role was set correctly
            self.assertEqual(user.role, role)
        
        self.assertEqual(User.objects.count(), 2)



# ========== APPOINTMENT MODEL TESTS ==========
class AppointmentModelCreationTest(TestCase):
    """Tests for Appointment model creation"""

    def setUp(self):
        """Create only the necessary objects for appointment tests"""
        self.patient = User.objects.create(
            email="patient@example.com",
            fullname="Patient One",
            gender="male",
            role="user"
        )
        self.doctor = User.objects.create(
            email="doctor@example.com",
            fullname="Doctor One",
            gender="female",
            role="doctor",
            license_no="DOC123"
        )

    def test_appointment_creation_with_defaults(self):
        """Test that appointment is created with correct default values"""
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            disease="Flu",
            symptoms=["fever", "cough"],
            date=timezone.now().date(),
            time_slot="10:00-11:00"
        )
        
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.doctor, self.doctor)
        self.assertEqual(appointment.disease, "Flu")
        self.assertEqual(appointment.symptoms, ["fever", "cough"])
        self.assertEqual(appointment.priority, "normal")
        self.assertEqual(appointment.status, "pending")

    def test_appointment_with_custom_status(self):
        """Test appointment creation with custom status"""
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            disease="Headache",
            date=timezone.now().date(),
            time_slot="14:00-15:00",
            status="confirmed"
        )
        
        self.assertEqual(appointment.status, "confirmed")

    def test_appointment_str_representation(self):
        """Test string representation of appointment"""
        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            disease="Cold",
            date=timezone.now().date(),
            time_slot="09:00-10:00"
        )
        
        expected = f"{self.patient.fullname} → {self.doctor.fullname} on {appointment.date} {appointment.time_slot}"
        self.assertEqual(str(appointment), expected)


class AppointmentModelConstraintsTest(TestCase):
    """Tests for Appointment model constraints and business rules"""

    def setUp(self):
        """Create patients and doctor for constraint tests"""
        self.patient1 = User.objects.create(
            email="patient1@example.com",
            fullname="Patient One",
            gender="male",
            role="user"
        )
        self.patient2 = User.objects.create(
            email="patient2@example.com",
            fullname="Patient Two",
            gender="female",
            role="user"
        )
        self.doctor = User.objects.create(
            email="doctor@example.com",
            fullname="Doctor One",
            gender="male",
            role="doctor",
            license_no="DOC456"
        )
        self.appointment_date = timezone.now().date()

    def test_double_booking_same_doctor_same_slot(self):
        """Test that same doctor cannot be double-booked for same date+slot"""
        Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor,
            disease="Flu",
            date=self.appointment_date,
            time_slot="10:00-11:00"
        )
        
        with self.assertRaises(IntegrityError):
            Appointment.objects.create(
                patient=self.patient2,
                doctor=self.doctor,
                disease="Cold",
                date=self.appointment_date,
                time_slot="10:00-11:00"
            )

    def test_different_time_slots_same_doctor_allowed(self):
        """Test that same doctor can have multiple appointments on same date with different slots"""
        appt1 = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor,
            disease="Flu",
            date=self.appointment_date,
            time_slot="10:00-11:00"
        )
        
        appt2 = Appointment.objects.create(
            patient=self.patient2,
            doctor=self.doctor,
            disease="Headache",
            date=self.appointment_date,
            time_slot="11:00-12:00"
        )
        
        self.assertEqual(Appointment.objects.count(), 2)
        self.assertEqual(appt1.time_slot, "10:00-11:00")
        self.assertEqual(appt2.time_slot, "11:00-12:00")

    def test_same_slot_different_doctors_allowed(self):
        """Test that different doctors can use same slot on same date"""
        doctor2 = User.objects.create(
            email="doctor2@example.com",
            fullname="Doctor Two",
            gender="female",
            role="doctor",
            license_no="DOC789"
        )
        
        appt1 = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor,
            disease="Flu",
            date=self.appointment_date,
            time_slot="10:00-11:00"
        )
        
        appt2 = Appointment.objects.create(
            patient=self.patient2,
            doctor=doctor2,
            disease="Migraine",
            date=self.appointment_date,
            time_slot="10:00-11:00"
        )
        
        self.assertEqual(Appointment.objects.count(), 2)
        self.assertNotEqual(appt1.doctor, appt2.doctor)

    def test_same_patient_multiple_appointments_allowed(self):
        """Test that same patient can have multiple appointments with different doctors"""
        doctor2 = User.objects.create(
            email="doctor2@example.com",
            fullname="Doctor Two",
            gender="male",
            role="doctor",
            license_no="DOC999"
        )
        
        appt1 = Appointment.objects.create(
            patient=self.patient1,
            doctor=self.doctor,
            disease="Flu",
            date=self.appointment_date,
            time_slot="10:00-11:00"
        )
        
        appt2 = Appointment.objects.create(
            patient=self.patient1,
            doctor=doctor2,
            disease="Checkup",
            date=self.appointment_date,
            time_slot="14:00-15:00"
        )
        
        self.assertEqual(self.patient1.patient_appointments.count(), 2)


class AppointmentModelValidationTest(TestCase):
    """Tests for Appointment model validation"""

    def setUp(self):
        """Create users for validation tests"""
        self.patient = User.objects.create(
            email="patient@example.com",
            fullname="Patient",
            gender="male",
            role="user"
        )
        self.doctor = User.objects.create(
            email="doctor@example.com",
            fullname="Doctor",
            gender="female",
            role="doctor",
            license_no="DOC111"
        )

    def test_invalid_status_validation(self):
        """Test that invalid status raises ValidationError"""
        appointment = Appointment(
            patient=self.patient,
            doctor=self.doctor,
            disease="Test",
            date=timezone.now().date(),
            time_slot="10:00-11:00",
            status="invalid_status"
        )
        
        with self.assertRaises(ValidationError) as context:
            appointment.full_clean()
        
        self.assertIn('status', context.exception.error_dict)

    def test_valid_status_choices(self):
        """Test all valid status choices"""
        valid_statuses = ['pending', 'confirmed', 'cancelled', 'completed']
        appointment_date = timezone.now().date()
        
        for i, status in enumerate(valid_statuses):
            appointment = Appointment(
                patient=self.patient,
                doctor=self.doctor,
                disease="Test",
                date=appointment_date,
                time_slot=f"{i+8}:00-{i+9}:00",
                status=status
            )
            
            # Should not raise ValidationError
            appointment.full_clean()
            appointment.save()
        
        self.assertEqual(Appointment.objects.count(), 4)

    def test_invalid_priority_validation(self):
        """Test that invalid priority raises ValidationError"""
        appointment = Appointment(
            patient=self.patient,
            doctor=self.doctor,
            disease="Test",
            date=timezone.now().date(),
            time_slot="10:00-11:00",
            priority="ultra_urgent"
        )
        
        with self.assertRaises(ValidationError) as context:
            appointment.full_clean()
        
        self.assertIn('priority', context.exception.error_dict)