# Paralegal Assignment Feature

## Overview
Added functionality for Super Admin and Admin to assign paralegals to advocates through the frontend UI.

## Backend API (Already Existed)
- **Endpoint:** `POST /api/users/assign_paralegal/`
- **Permissions:** Super Admin, Admin, Advocate (self-assign only)
- **Request Body:**
  ```json
  {
    "paralegal_id": "uuid",
    "advocate_id": "uuid"
  }
  ```

## Frontend Changes

### 1. New Components Created

#### `frontend/components/platform/AssignParalegalModal.tsx`
- Modal dialog for assigning a paralegal to an advocate
- Fetches list of advocates from the firm
- Handles the assignment API call
- Shows loading states and error messages

#### `frontend/components/platform/ParalegalManagementPage.tsx`
- Complete paralegal management page
- Lists all paralegals in the firm
- Search functionality
- "Assign to Advocate" button for each paralegal
- Opens assignment modal on click

### 2. Updated Files

#### `frontend/lib/api.ts`
Added new API endpoints:
- `USERS.ASSIGN_PARALEGAL`
- `USERS.UNASSIGN_PARALEGAL`
- `USERS.MY_PARALEGALS`
- `USERS.MY_ADVOCATES`

#### `frontend/app/(platform)/super-admin/users/paralegal/page.tsx`
- Changed from generic `TeamPage` to custom `ParalegalManagementPage`
- Now shows assignment functionality

#### `frontend/app/(platform)/firm-admin/users/paralegal/page.tsx`
- Changed from generic `TeamPage` to custom `ParalegalManagementPage`
- Now shows assignment functionality

## How to Use

### For Super Admin / Admin:
1. Navigate to **Team Management > Paralegals**
2. You'll see a list of all paralegals in your firm
3. Click **"Assign to Advocate"** button next to any paralegal
4. Select an advocate from the dropdown
5. Click **"Assign Paralegal"**
6. The paralegal is now assigned to that advocate

### Features:
- ✅ Search paralegals by name, email, or phone
- ✅ View paralegal status (Active/Inactive)
- ✅ Assign multiple paralegals to the same advocate
- ✅ Real-time updates after assignment
- ✅ Error handling and loading states
- ✅ Responsive design

## API Integration
The frontend now properly integrates with the existing backend API:
- Fetches advocates: `GET /api/users/?user_type=advocate`
- Assigns paralegal: `POST /api/users/assign_paralegal/`
- Lists paralegals: `GET /api/users/?user_type=paralegal`

## Testing
1. Login as Super Admin or Admin
2. Go to `/super-admin/users/paralegal` or `/firm-admin/users/paralegal`
3. Click "Assign to Advocate" on any paralegal
4. Select an advocate and submit
5. Verify the assignment was successful

## Notes
- The backend API was already complete and working
- Only frontend UI was missing
- Now both Super Admin and Admin can easily assign paralegals to advocates
- The feature is fully functional and ready to use
