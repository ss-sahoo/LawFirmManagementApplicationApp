# Phone Verification Implementation

## Overview
Added comprehensive phone verification for all user types during signup and profile updates. Users must verify their phone number via OTP before completing registration or changing their phone number.

## Backend Changes

### 1. New OTP Service (`backend/accounts/otp_service.py`)
- Handles OTP generation, sending, and verification
- 10-minute OTP expiry
- 5 maximum attempts
- 60-second resend cooldown
- Stores registration OTPs in cache, profile update OTPs in database

### 2. New API Endpoints (`backend/accounts/views.py`)

#### Send Phone OTP
```
POST /api/users/send_phone_otp/
Body: {
  "phone_number": "+919876543210",
  "purpose": "registration" | "update"
}
```
- Generates and sends 6-digit OTP via SMS
- Checks for duplicate phone numbers during registration
- Implements cooldown to prevent spam

#### Verify Phone OTP
```
POST /api/users/verify_phone_otp/
Body: {
  "phone_number": "+919876543210",
  "otp": "123456",
  "purpose": "registration" | "update"
}
```
- Verifies the OTP code
- Tracks attempts (max 5)
- Marks phone as verified for 1 hour (registration) or updates user record (profile update)

### 3. Updated Registration Flow (`backend/accounts/serializers.py`)
- `UserRegistrationSerializer.validate()` now checks if phone is verified via OTP
- Registration fails if phone verification is missing
- Automatically marks `is_phone_verified=True` on successful registration
- Clears OTP cache after successful registration

### 4. Updated Profile Update Flow (`backend/accounts/views.py`)
- `CustomUserViewSet.update()` and `partial_update()` override
- Requires phone verification when changing phone number
- Checks for recent OTP verification (within 1 hour)
- Updates `is_phone_verified` flag

## Frontend Changes

### 1. Phone Verification Component (`frontend/components/PhoneVerification.tsx`)
Reusable component for phone verification with:
- Send OTP button
- OTP input field (6 digits)
- Resend OTP with cooldown timer
- Verification status display
- Error handling
- Loading states

**Props:**
```typescript
{
  phoneNumber: string;
  onVerified: () => void;
  purpose?: 'registration' | 'update';
  className?: string;
}
```

### 2. API Configuration (`frontend/lib/api.ts`)
Added new endpoints:
- `API.USERS.SEND_PHONE_OTP`
- `API.USERS.VERIFY_PHONE_OTP`

## Integration Guide

### For Registration Pages

1. Import the component:
```typescript
import PhoneVerification from '@/components/PhoneVerification';
```

2. Add state for verification:
```typescript
const [phoneVerified, setPhoneVerified] = useState(false);
```

3. Add the component before the submit button:
```typescript
{formData.phone_number && !phoneVerified && (
  <PhoneVerification
    phoneNumber={formData.phone_number}
    onVerified={() => setPhoneVerified(true)}
    purpose="registration"
  />
)}
```

4. Disable submit until verified:
```typescript
<button
  type="submit"
  disabled={!phoneVerified || loading}
>
  Register
</button>
```

### For Profile Update Pages

1. When user changes phone number, show verification:
```typescript
{newPhone && newPhone !== currentPhone && (
  <PhoneVerification
    phoneNumber={newPhone}
    onVerified={() => setPhoneVerified(true)}
    purpose="update"
  />
)}
```

2. Include verification flag in update request:
```typescript
const payload = {
  ...formData,
  phone_verified: phoneVerified
};
```

## SMS Provider Integration

Currently, OTPs are printed to console (development mode). To integrate with a real SMS provider:

1. Update `backend/accounts/views.py` `send_otp_sms()` function
2. Add SMS provider credentials to settings
3. Uncomment and configure the SMS provider code (Twilio, AWS SNS, MSG91, etc.)

Example for Twilio:
```python
from twilio.rest import Client

def send_otp_sms(phone_number, otp_code):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=f"Your AntLegal verification code is {otp_code}. Valid for 10 minutes.",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone_number
    )
    return True
```

## Security Features

1. **Rate Limiting**: 60-second cooldown between OTP requests
2. **Attempt Limiting**: Maximum 5 verification attempts per OTP
3. **Time-based Expiry**: OTPs expire after 10 minutes
4. **Verification Window**: Profile update verifications valid for 1 hour
5. **Cache-based Storage**: Registration OTPs stored in cache (auto-cleanup)
6. **Database Storage**: Profile update OTPs stored in database for audit trail

## Testing

### Test Registration Flow:
1. Enter phone number in registration form
2. Click "Send OTP"
3. Check console for OTP code (development mode)
4. Enter OTP and verify
5. Complete registration

### Test Profile Update Flow:
1. Login to user account
2. Navigate to profile settings
3. Change phone number
4. Verify new phone number via OTP
5. Save profile

## Database Models

### OTPVerification Model
- `user`: ForeignKey to CustomUser
- `otp_type`: 'phone' or 'email'
- `otp_code`: 6-digit code
- `is_verified`: Boolean
- `attempts`: Integer (max 5)
- `created_at`: Timestamp
- `expires_at`: Timestamp

### CustomUser Model
- `is_phone_verified`: Boolean flag
- Updated on successful verification

## Error Handling

The system handles:
- Invalid phone numbers
- Duplicate phone numbers
- Expired OTPs
- Maximum attempts exceeded
- Network failures
- Missing verification

All errors are user-friendly and actionable.

## Future Enhancements

1. Email verification (similar flow)
2. Two-factor authentication (2FA)
3. SMS provider fallback
4. International phone number support
5. Voice call OTP option
6. Biometric verification
