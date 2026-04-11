
from django.urls import path, include
from core.views import (
    UserView, loginview, welcomeview, passwordchangelink,
    resetpasswordview, logoutview, ActivateAccountView,
    PredictDiseaseView, DoctorListView, AppointmentView,
    AppointmentStatusView, AvailableSlotsView, PatientNotificationsView,
    AppointmentDeleteView,
)

urlpatterns = [
    path("register/", UserView.as_view(), name="register"),
    path("login/", loginview.as_view(), name="login"),
    path("welcome/", welcomeview.as_view(), name="welcome"),
    path("logout/", logoutview.as_view(), name="logout"),
    path("reset/", passwordchangelink.as_view(), name='password_reset'),
    path('pass_reset/<uid>/<token>/', resetpasswordview.as_view(), name='password_reset_confirm'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),
    path("predict/", PredictDiseaseView.as_view(), name='predict_disease'),

    # Doctor listing & available slots
    path("doctors/", DoctorListView.as_view(), name='doctor_list'),
    path("doctors/<int:doctor_id>/slots/", AvailableSlotsView.as_view(), name='available_slots'),

    # Appointments
    path("appointments/", AppointmentView.as_view(), name='appointments'),
    path("appointments/<int:pk>/status/", AppointmentStatusView.as_view(), name='appointment_status'),
    path("appointments/<int:pk>/delete/", AppointmentDeleteView.as_view(), name='appointment_delete'),

    # Patient notifications
    path("notifications/", PatientNotificationsView.as_view(), name='patient_notifications'),
]
