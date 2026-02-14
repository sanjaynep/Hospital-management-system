from django.contrib import messages
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer, loginserializer,welcomeSerializer,linkserializer, resetpasswordserializer
from django.contrib.auth import authenticate
from .error import AccountErrorRenderer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import  RefreshToken
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from .models import User
from .utils import send_activation_email

def get_tokens_for_user(user):
    if not user.is_active:
      raise AuthenticationFailed("User is not active")

    refresh = RefreshToken.for_user(user)

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UserView(APIView):
    renderer_classes = [AccountErrorRenderer]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            new_user = serializer.save()
            # User is inactive by default, send activation email
            uid = urlsafe_base64_encode(force_bytes(new_user.pk))
            token = default_token_generator.make_token(new_user)
            # Build activation URL (frontend URL that will call the backend activate endpoint)
            activation_url = f"http://localhost:5173/activate/{uid}/{token}/"
            send_activation_email(new_user.email, activation_url)
            return Response({'msg': 'Registration successful. Please check your email to activate your account.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ActivateAccountView(APIView):
    renderer_classes = [AccountErrorRenderer]
    
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user_obj = User.objects.get(pk=uid)
            
            if user_obj.is_active:
                return Response({'msg': 'Account is already activated'}, status=status.HTTP_400_BAD_REQUEST)

            if default_token_generator.check_token(user_obj, token):
                user_obj.is_active = True
                user_obj.save()
                return Response({'msg': 'Account activated successfully! You can now login.'}, status=status.HTTP_200_OK)
            else:
                return Response({'msg': 'Activation link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'msg': 'Activation link is invalid or has expired.'}, status=status.HTTP_400_BAD_REQUEST)


class loginview(APIView):
    renderer_classes = [AccountErrorRenderer]
    def post(self, request):
        serializer=loginserializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email=serializer.validated_data.get('email')
            password=serializer.validated_data.get('password')
            user=authenticate(email=email, password=password)
            if user is None:
                return Response({'msg':'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                token=get_tokens_for_user(user)
                return Response({
                    'msg':'login successful', 
                    'token': token,
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'fullname': user.fullname,
                        'role': user.role
                    }
                }, status=status.HTTP_200_OK)

        return Response({'msg':'login failed'}, status=status.HTTP_400_BAD_REQUEST)
    
class welcomeview(APIView):
    renderer_classes = [AccountErrorRenderer]
    permission_classes = [IsAuthenticated]
    def get (self, request):
        serializer=welcomeSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
     
class logoutview(APIView):
    renderer_classes = [AccountErrorRenderer]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refreshtoken=request.data.get('refresh')
            token=RefreshToken(refreshtoken)
            token.blacklist()
            return Response({'msg':'logout successful'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'msg':'logout failed'}, status=status.HTTP_400_BAD_REQUEST)

class passwordchangelink(APIView):
    renderer_classes = [AccountErrorRenderer]
    def post(self, request):
        serializer=linkserializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
           return Response({'msg':'password change link sent to your email'}, status=status.HTTP_200_OK)
        

class resetpasswordview(APIView):
    renderer_classes = [AccountErrorRenderer]
    def post(self,request,uid,token):
        serializer= resetpasswordserializer(data=request.data, context={'uid':uid, 'token':token})
        if serializer.is_valid(raise_exception=True):
            return Response({'msg':'password reset successful'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)