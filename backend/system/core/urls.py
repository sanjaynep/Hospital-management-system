
from django.urls import path,include
from .views import Signup

urlpatterns = [
    path('user/', Signup.as_view(),name="signup"),
    
]