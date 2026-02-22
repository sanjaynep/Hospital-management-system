
from django.urls import path, include
from core.views import UserView, loginview, welcomeview, passwordchangelink, resetpasswordview, logoutview, ActivateAccountView,PredictDiseaseView

urlpatterns = [
    path("register/", UserView.as_view(), name="register"),
    path("login/", loginview.as_view(), name="login"),
    path("welcome/", welcomeview.as_view(), name="welcome"),
    path("logout/", logoutview.as_view(), name="logout"),
    path("reset/", passwordchangelink.as_view(), name='password_reset'),
    path('pass_reset/<uid>/<token>/', resetpasswordview.as_view(), name='password_reset_confirm'),
    path('activate/<uidb64>/<token>/', ActivateAccountView.as_view(), name='activate'),
    path("predict/", PredictDiseaseView.as_view(), name='predict_disease'),
]
