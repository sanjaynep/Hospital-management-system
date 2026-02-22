from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string  
from django.utils.html import strip_tags
from django.conf import settings    
import threading
import os
import joblib
import pandas as pd

class SendMailThread(threading.Thread):
    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)

    def run(self):
        self.email.send()

def send_activation_email(recipient_email, activation_url):
    subject = "Activate your account on " + settings.SITE_NAME
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [recipient_email]

    html_content = render_to_string('activate_form.html', {'activation_url': activation_url})
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    email.attach_alternative(html_content, "text/html")
    SendMailThread(email).start()

def send_password_reset_email(recipient_email, reset_url):
    subject = "Reset your password on " + settings.SITE_NAME
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [recipient_email]

    html_content = render_to_string('password_reset_email.html', {'reset_link': reset_url})
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    email.attach_alternative(html_content, "text/html")
    SendMailThread(email).start()



class ModelWiring:
    # Path to your model file
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "disease_model.pkl")

    # Load once at startup
    model = joblib.load(MODEL_PATH)

    # Full symptom list (must match training order)
    SYMPTOMS = ['back_pain','constipation','abdominal_pain','diarrhoea','mild_fever','yellow_urine',
        'yellowing_of_eyes','acute_liver_failure','fluid_overload','swelling_of_stomach',
        'swelled_lymph_nodes','malaise','blurred_and_distorted_vision','phlegm','throat_irritation',
        'redness_of_eyes','sinus_pressure','runny_nose','congestion','chest_pain','weakness_in_limbs',
        'fast_heart_rate','pain_during_bowel_movements','pain_in_anal_region','bloody_stool',
        'irritation_in_anus','neck_pain','dizziness','cramps','bruising','obesity','swollen_legs',
        'swollen_blood_vessels','puffy_face_and_eyes','enlarged_thyroid','brittle_nails',
        'swollen_extremeties','excessive_hunger','extra_marital_contacts','drying_and_tingling_lips',
        'slurred_speech','knee_pain','hip_joint_pain','muscle_weakness','stiff_neck','swelling_joints',
        'movement_stiffness','spinning_movements','loss_of_balance','unsteadiness',
        'weakness_of_one_body_side','loss_of_smell','bladder_discomfort','foul_smell_of urine',
        'continuous_feel_of_urine','passage_of_gases','internal_itching','toxic_look_(typhos)',
        'depression','irritability','muscle_pain','altered_sensorium','red_spots_over_body','belly_pain',
        'abnormal_menstruation','dischromic _patches','watering_from_eyes','increased_appetite','polyuria','family_history','mucoid_sputum',
        'rusty_sputum','lack_of_concentration','visual_disturbances','receiving_blood_transfusion',
        'receiving_unsterile_injections','coma','stomach_bleeding','distention_of_abdomen',
        'history_of_alcohol_consumption','fluid_overload','blood_in_sputum','prominent_veins_on_calf',
        'palpitations','painful_walking','pus_filled_pimples','blackheads','scurring','skin_peeling',
        'silver_like_dusting','small_dents_in_nails','inflammatory_nails','blister','red_sore_around_nose',
        'yellow_crust_ooze']

    @classmethod
    def symptoms_to_vector(cls, selected_symptoms):
        # Iterate over full symptom list, not just selected ones
        return [1 if symptom in selected_symptoms else 0 for symptom in cls.SYMPTOMS]

    @classmethod
    def predict(cls, selected_symptoms):
        vector = cls.symptoms_to_vector(selected_symptoms)
        # Build a DataFrame with the same feature names used in training
        try:
            X = pd.DataFrame([vector], columns=cls.SYMPTOMS)
            prediction_code = cls.model.predict(X)[0]
        except Exception:
            # Fallback to list input if DataFrame construction fails
            prediction_code = cls.model.predict([vector])[0]
        return prediction_code