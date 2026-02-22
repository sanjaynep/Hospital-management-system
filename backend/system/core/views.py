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
from .utils import send_activation_email,ModelWiring

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
    

    # appointment booking

class PredictDiseaseView(APIView):
    def post(self, request):
        # Parse JSON body (DRF already parses request.data, so you can skip json.loads)
        selected_symptoms = request.data.get("symptoms", [])

        # Run prediction
        prediction_code = ModelWiring.predict(selected_symptoms)

        # Map numeric code back to disease name
        disease_map = {
            0:'Fungal infection',1:'Allergy',2:'GERD',3:'Chronic cholestasis',4:'Drug Reaction',
            5:'Peptic ulcer diseae',6:'AIDS',7:'Diabetes ',8:'Gastroenteritis',9:'Bronchial Asthma',
            10:'Hypertension ',11:'Migraine',12:'Cervical spondylosis',13:'Paralysis (brain hemorrhage)',
            14:'Jaundice',15:'Malaria',16:'Chicken pox',17:'Dengue',18:'Typhoid',19:'hepatitis A',
            20:'Hepatitis B',21:'Hepatitis C',22:'Hepatitis D',23:'Hepatitis E',24:'Alcoholic hepatitis',
            25:'Tuberculosis',26:'Common Cold',27:'Pneumonia',28:'Dimorphic hemmorhoids(piles)',
            29:'Heart attack',30:'Varicose veins',31:'Hypothyroidism',32:'Hyperthyroidism',
            33:'Hypoglycemia',34:'Osteoarthristis',35:'Arthritis',36:'(vertigo) Paroymsal  Positional Vertigo',
            37:'Acne',38:'Urinary tract infection',39:'Psoriasis',40:'Impetigo'
        }

        predicted_disease = disease_map.get(prediction_code, "Unknown")

        doctor_map = {
            'Fungal infection': 'dermatology',
            'Allergy': 'general_physician',
            'GERD': 'general_physician',
            'Chronic cholestasis': 'general_physician',
            'Drug Reaction': 'general_physician',
            'Peptic ulcer diseae': 'general_physician',
            'AIDS': 'general_physician',
            'Diabetes ': 'dermatology',
            'Gastroenteritis': 'general_physician',
            'Bronchial Asthma': 'cardiologist',
            'Hypertension ': 'cardiologist',
            'Migraine': 'neuro_ortho',
            'Cervical spondylosis': 'neuro_ortho',
            'Paralysis (brain hemorrhage)': 'neuro_ortho',
            'Jaundice': 'general_physician',
            'Malaria': 'general_physician',
            'Chicken pox': 'general_physician',
            'Dengue': 'general_physician',
            'Typhoid': 'general_physician',
            'hepatitis A': 'general_physician',
            'Hepatitis B': 'general_physician',
            'Hepatitis C': 'general_physician',
            'Hepatitis D': 'general_physician',
            'Hepatitis E': 'general_physician',
            'Alcoholic hepatitis': 'general_physician',
            'Tuberculosis': 'cardiologist',
            'Common Cold': 'general_physician',
            'Pneumonia': 'cardiologist',
            'Dimorphic hemmorhoids(piles)': 'general_physician',
            'Heart attack': 'cardiologist',
            'Varicose veins': 'cardiologist',
            'Hypothyroidism': 'dermatology',
            'Hyperthyroidism': 'dermatology',
            'Hypoglycemia': 'dermatology',
            'Osteoarthristis': 'neuro_ortho',
            'Arthritis': 'neuro_ortho',
            '(vertigo) Paroymsal  Positional Vertigo': 'neuro_ortho',
            'Acne': 'dermatology',
            'Urinary tract infection': 'general_physician',
            'Psoriasis': 'dermatology',
            'Impetigo': 'dermatology'
        }

        suggested_doctor = doctor_map.get(predicted_disease, "general_physician")


        return Response({"predicted_disease": predicted_disease , "suggested_doctor":suggested_doctor})
