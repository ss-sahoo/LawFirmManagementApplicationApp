# API Features Summary

## 1. Firm Suspension/Activation by Platform Owner

### Suspend Firm
**Endpoint:** `POST /api/firms/{firm_id}/suspend/`  
**Permission:** Platform Owner only  
**Description:** Suspends a firm by setting `is_active = False`

**Example:**
```bash
POST /api/firms/123e4567-e89b-12d3-a456-426614174000/suspend/
Authorization: Token <platform_owner_token>
```

**Response:**
```json
{
  "message": "Firm 'ABC Law Firm' has been suspended",
  "firm": { ... firm details ... }
}
```

### Unsuspend/Activate Firm
**Endpoint:** `POST /api/firms/{firm_id}/unsuspend/`  
**Permission:** Platform Owner only  
**Description:** Activates a suspended firm by setting `is_active = True`

**Example:**
```bash
POST /api/firms/123e4567-e89b-12d3-a456-426614174000/unsuspend/
Authorization: Token <platform_owner_token>
```

**Response:**
```json
{
  "message": "Firm 'ABC Law Firm' has been activated",
  "firm": { ... firm details ... }
}
```

---

## 2. User Profile Image Upload

### Update User Profile (Including Profile Image)
**Endpoint:** `PATCH /api/users/{user_id}/`  
**Permission:** Authenticated user (can update own profile)  
**Description:** Users can update their profile including uploading profile_image

**Example:**
```bash
PATCH /api/users/123e4567-e89b-12d3-a456-426614174000/
Authorization: Token <user_token>
Content-Type: multipart/form-data

{
  "first_name": "John",
  "last_name": "Doe",
  "profile_image": <file upload>
}
```

**Fields in CustomUserSerializer:**
- `profile_image` - ImageField for user profile picture
- All other user fields (name, email, phone, address, etc.)

---

## 3. Firm Logo Upload (Edit Firm Section)

### Update Firm Details (Including Logo)
**Endpoint:** `PATCH /api/firms/{firm_id}/`  
**Permission:** Platform Owner, Partner Manager, or Super Admin  
**Description:** Update firm details including logo upload

**Example:**
```bash
PATCH /api/firms/123e4567-e89b-12d3-a456-426614174000/
Authorization: Token <super_admin_token>
Content-Type: multipart/form-data

{
  "firm_name": "ABC Law Firm",
  "logo": <file upload>,
  "practice_areas": ["Criminal", "Civil"],
  "website": "https://abclawfirm.com"
}
```

**Fields in FirmSerializer:**
- `logo` - ImageField for firm logo
- `firm_name`, `firm_code`, `city`, `state`, `country`
- `address`, `postal_code`, `registration_number`
- `practice_areas` - JSON field
- `phone_number`, `email`, `website`
- `subscription_type`, `is_active`

---

## Summary

✅ **Firm Suspension API:** YES - Implemented at `/api/firms/{id}/suspend/` and `/api/firms/{id}/unsuspend/`

✅ **User Profile Image Upload:** YES - Available via `PATCH /api/users/{id}/` with `profile_image` field

✅ **Firm Logo Upload:** YES - Available via `PATCH /api/firms/{id}/` with `logo` field

All three features are fully implemented and ready for deployment!
