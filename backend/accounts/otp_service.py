"""
OTP Service for Phone Verification
Handles OTP generation, sending, and verification
"""
import random
import string
from datetime import timedelta
from django.utils import timezone
from django.core.cache import cache
from .models import OTPVerification, CustomUser


class OTPService:
    """Service for handling OTP operations"""
    
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5
    RESEND_COOLDOWN_SECONDS = 60
    
    @staticmethod
    def generate_otp(length=6):
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    @classmethod
    def send_phone_otp(cls, phone_number, user=None, purpose='verification'):
        """
        Generate and send OTP to phone number
        Returns: (success, message, otp_id)
        """
        # Check cooldown
        cooldown_key = f'otp_cooldown_{phone_number}'
        if cache.get(cooldown_key):
            remaining = cache.ttl(cooldown_key)
            return False, f'Please wait {remaining} seconds before requesting another OTP', None
        
        # Generate OTP
        otp_code = cls.generate_otp()
        expires_at = timezone.now() + timedelta(minutes=cls.OTP_EXPIRY_MINUTES)
        
        # Create OTP record
        if user:
            otp_record = OTPVerification.objects.create(
                user=user,
                otp_type='phone',
                otp_code=otp_code,
                expires_at=expires_at
            )
        else:
            # For registration, store in cache temporarily
            cache_key = f'otp_registration_{phone_number}'
            cache.set(cache_key, {
                'otp_code': otp_code,
                'expires_at': expires_at.isoformat(),
                'attempts': 0,
                'purpose': purpose
            }, timeout=cls.OTP_EXPIRY_MINUTES * 60)
            otp_record = None
        
        # Send SMS (integrate with SMS provider)
        success = cls._send_sms(phone_number, otp_code, purpose)
        
        if success:
            # Set cooldown
            cache.set(cooldown_key, True, timeout=cls.RESEND_COOLDOWN_SECONDS)
            
            otp_id = str(otp_record.id) if otp_record else phone_number
            return True, f'OTP sent to {phone_number}', otp_id
        else:
            return False, 'Failed to send OTP. Please try again.', None
    
    @classmethod
    def verify_phone_otp(cls, phone_number, otp_code, user=None):
        """
        Verify OTP for phone number
        Returns: (success, message)
        """
        if user:
            # Verify for existing user
            try:
                otp_record = OTPVerification.objects.filter(
                    user=user,
                    otp_type='phone',
                    is_verified=False
                ).latest('created_at')
                
                if otp_record.is_expired():
                    return False, 'OTP has expired. Please request a new one.'
                
                if otp_record.attempts >= cls.MAX_ATTEMPTS:
                    return False, 'Maximum verification attempts exceeded. Please request a new OTP.'
                
                otp_record.attempts += 1
                otp_record.save()
                
                if otp_record.otp_code == otp_code:
                    otp_record.is_verified = True
                    otp_record.save()
                    
                    # Update user
                    user.is_phone_verified = True
                    user.save()
                    
                    return True, 'Phone number verified successfully'
                else:
                    remaining = cls.MAX_ATTEMPTS - otp_record.attempts
                    return False, f'Invalid OTP. {remaining} attempts remaining.'
                    
            except OTPVerification.DoesNotExist:
                return False, 'No OTP found. Please request a new one.'
        else:
            # Verify for registration
            cache_key = f'otp_registration_{phone_number}'
            otp_data = cache.get(cache_key)
            
            if not otp_data:
                return False, 'OTP has expired or not found. Please request a new one.'
            
            expires_at = timezone.datetime.fromisoformat(otp_data['expires_at'])
            if timezone.now() > expires_at:
                cache.delete(cache_key)
                return False, 'OTP has expired. Please request a new one.'
            
            if otp_data['attempts'] >= cls.MAX_ATTEMPTS:
                cache.delete(cache_key)
                return False, 'Maximum verification attempts exceeded. Please request a new OTP.'
            
            otp_data['attempts'] += 1
            cache.set(cache_key, otp_data, timeout=cls.OTP_EXPIRY_MINUTES * 60)
            
            if otp_data['otp_code'] == otp_code:
                # Mark as verified
                otp_data['verified'] = True
                cache.set(cache_key, otp_data, timeout=3600)  # Keep for 1 hour
                return True, 'Phone number verified successfully'
            else:
                remaining = cls.MAX_ATTEMPTS - otp_data['attempts']
                return False, f'Invalid OTP. {remaining} attempts remaining.'
    
    @classmethod
    def is_phone_verified_for_registration(cls, phone_number):
        """Check if phone is verified for registration"""
        cache_key = f'otp_registration_{phone_number}'
        otp_data = cache.get(cache_key)
        return otp_data and otp_data.get('verified', False)
    
    @staticmethod
    def _send_sms(phone_number, otp_code, purpose='verification'):
        """
        Send SMS via SMS provider
        TODO: Integrate with actual SMS provider (Twilio, AWS SNS, MSG91, etc.)
        """
        # For development, just print to console
        print(f"\n{'='*50}")
        print(f"SMS to {phone_number}")
        print(f"Purpose: {purpose}")
        print(f"OTP Code: {otp_code}")
        print(f"Valid for {OTPService.OTP_EXPIRY_MINUTES} minutes")
        print(f"{'='*50}\n")
        
        # TODO: Replace with actual SMS provider integration
        # Example for Twilio:
        # from twilio.rest import Client
        # client = Client(account_sid, auth_token)
        # message = client.messages.create(
        #     body=f"Your OTP is {otp_code}. Valid for {cls.OTP_EXPIRY_MINUTES} minutes.",
        #     from_='+1234567890',
        #     to=phone_number
        # )
        
        # For now, return True (development mode)
        return True
