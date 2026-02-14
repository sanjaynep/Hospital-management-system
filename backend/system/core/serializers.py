from core.models import User
from rest_framework import serializers
from django.utils.encoding import force_bytes, smart_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from core.utils import send_password_reset_email
import re

class UserSerializer(serializers.ModelSerializer):
    confirmpassword = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'role', 'email', 'fullname', 'password', 'confirmpassword',
            'gender', 'contact', 'specialization', 'license_no', 'experience'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value.lower()

    def validate_fullname(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters")
        return value

    def validate(self, attrs):
        role = attrs.get('role')
        password = attrs.get('password')
        confirmpassword = attrs.get('confirmpassword')
        
        # Check gender is provided (required for all users)
        if not attrs.get('gender'):
            raise serializers.ValidationError("Gender is required.")

        # Password checks
        if password != confirmpassword:
            raise serializers.ValidationError("Password and Confirm Password doesn't match")
        if len(password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', password):
            raise serializers.ValidationError("Password must contain at least one digit")
        if not re.search(r'[@$!%*?&]', password):
            raise serializers.ValidationError("Password must contain at least one special character (@$!%*?&)")

        # Role-based checks
        if role == 'doctor':
            required_fields = ['license_no', 'experience', 'contact', 'specialization']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({
                        field: f"{field.replace('_', ' ').title()} is required for doctors."
                    })
        elif role == 'user':
            attrs['license_no'] = None
            attrs['experience'] = None
            attrs['specialization'] = None
            attrs['contact'] = None

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmpassword')
        return User.objects.create_user(**validated_data)
    

class loginserializer(serializers.Serializer):
    email=serializers.EmailField(max_length=255, required=True)
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        fields=['email','password']

class welcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id', 'email', 'fullname']


class linkserializer(serializers.Serializer):
    email=serializers.EmailField(max_length=255)
    class Meta:
        fields=['email']

    def validate(self, attrs):
        email=attrs.get('email')
        if User.objects.filter(email=email).exists():
            user=User.objects.get(email=email)
            uid=urlsafe_base64_encode(force_bytes(user.id))
            token=default_token_generator.make_token(user)
                # send a frontend URL so the user lands on the React reset page
            link = f"http://localhost:5173/reset/{uid}/{token}/"
            # send email using utility function defined in account.utils
            # utils.send_password_reset_email(recipient_email, reset_url)
            send_password_reset_email(user.email, link)
            return attrs
        raise serializers.ValidationError("you are not a registered User")    

class resetpasswordserializer(serializers.Serializer):           
    password=serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    confirmpassword=serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    class Meta:
        fields=['password', 'confirmpassword']
    
    def validate(self, attrs):
        password=attrs.get('password')
        confirmpassword=attrs.get('confirmpassword')
        uid=self.context.get('uid')
        token=self.context.get('token')
        if password !=confirmpassword:
            raise serializers.ValidationError("Password and Confirm Password doesn't match")
        
        id=smart_str(urlsafe_base64_decode(uid))
        user=User.objects.get(id=id)

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Token is not valid or expired")
        user.set_password(password) 
        user.save()
        return attrs 