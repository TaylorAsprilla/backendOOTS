# Password Management API Documentation

## Overview

This document describes the password management endpoints for authenticated users and password recovery flows.

## Base URL

All endpoints are under: `/api/v1/auth`

---

## Endpoints

### 1. Change Password (Authenticated Users)

**Endpoint:** `PATCH /auth/change-password`

**Authentication:** Required (Bearer Token)

**Description:** Allows authenticated users to change their password by providing their current password and a new password.

**Request Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**

- `currentPassword`: Required, must match the user's current password
- `newPassword`: Required, minimum 8 characters, maximum 50 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%\*?&#)
- `confirmPassword`: Required, must match `newPassword`
- New password must be different from current password

**Success Response (200 OK):**

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Error Responses:**

**400 Bad Request** - Passwords don't match or validation failed:

```json
{
  "statusCode": 400,
  "message": "La nueva contraseña y su confirmación no coinciden",
  "error": "Bad Request"
}
```

**401 Unauthorized** - Current password incorrect:

```json
{
  "statusCode": 401,
  "message": "La contraseña actual es incorrecta",
  "error": "Unauthorized"
}
```

**Example cURL:**

```bash
curl -X PATCH http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "CurrentPass123!",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }'
```

---

### 2. Forgot Password (Public)

**Endpoint:** `POST /auth/forgot-password`

**Authentication:** Not required

**Description:** Initiates password recovery process by sending a reset token via email to the registered user.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "usuario@ejemplo.com"
}
```

**Validation Rules:**

- `email`: Required, must be a valid email format

**Success Response (200 OK):**

```json
{
  "message": "Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña"
}
```

**Notes:**

- Returns the same message whether the email exists or not (security best practice)
- If email exists, sends an email with a reset token valid for 24 hours
- Email contains a link: `http://yourdomain.com/reset-password?token=RESET_TOKEN`

**Error Responses:**

**400 Bad Request** - Email service error:

```json
{
  "statusCode": 400,
  "message": "Error enviando correo de recuperación. Intenta nuevamente",
  "error": "Bad Request"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com"
  }'
```

---

### 3. Reset Password (Public)

**Endpoint:** `POST /auth/reset-password`

**Authentication:** Not required

**Description:** Completes password recovery by setting a new password using the token received via email.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}
```

**Validation Rules:**

- `token`: Required, must be a valid non-expired reset token
- `newPassword`: Required, minimum 8 characters, maximum 50 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%\*?&#)
- `confirmPassword`: Required, must match `newPassword`
- New password must be different from previous password
- Token must not be expired (24 hours validity)

**Success Response (200 OK):**

```json
{
  "message": "Contraseña restablecida exitosamente"
}
```

**Error Responses:**

**400 Bad Request** - Invalid/expired token or validation failed:

```json
{
  "statusCode": 400,
  "message": "Token de recuperación inválido o expirado",
  "error": "Bad Request"
}
```

**400 Bad Request** - Passwords don't match:

```json
{
  "statusCode": 400,
  "message": "La nueva contraseña y su confirmación no coinciden",
  "error": "Bad Request"
}
```

**400 Bad Request** - Same password as before:

```json
{
  "statusCode": 400,
  "message": "La nueva contraseña debe ser diferente a la anterior",
  "error": "Bad Request"
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }'
```

---

## Complete Workflow Examples

### Change Password Flow (Authenticated User)

1. User logs in and obtains JWT token:

```bash
POST /auth/login
```

2. User requests password change:

```bash
PATCH /auth/change-password
Authorization: Bearer <token>
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

3. System validates current password, ensures new password is different, and updates

4. User receives success confirmation

---

### Forgot Password Flow (Unauthenticated)

1. User requests password reset:

```bash
POST /auth/forgot-password
{
  "email": "usuario@ejemplo.com"
}
```

2. System generates token, saves it with 24h expiration, sends email

3. User receives email with reset link:

```
http://yourdomain.com/reset-password?token=abc123...
```

4. User clicks link, enters new password:

```bash
POST /auth/reset-password
{
  "token": "abc123...",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}
```

5. System validates token, ensures new password is different, updates password, clears token

6. User can now login with new password

---

## Security Features

### Password Requirements

- Minimum 8 characters
- Maximum 50 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%\*?&#)

### Change Password Security

- Requires authentication via JWT
- Validates current password before allowing change
- Prevents using the same password
- Passwords are hashed using bcrypt with 12 salt rounds

### Password Recovery Security

- Token is 32 bytes random hex (64 characters)
- Token expires after 24 hours
- Token is single-use (cleared after successful reset)
- Same message returned whether email exists or not (prevents email enumeration)
- New password cannot be the same as previous password
- Token stored hashed in database

### Email Template

Password recovery emails include:

- User's full name
- Secure reset link with token
- Expiration time warning (24 hours)
- Security warnings about not sharing the link
- Fallback URL for manual copy-paste

---

## Database Schema Changes

New fields added to `users` table:

```sql
ALTER TABLE users
ADD COLUMN password_reset_token VARCHAR(255) NULL,
ADD COLUMN password_reset_expires DATETIME NULL;

CREATE INDEX idx_password_reset_token ON users(password_reset_token);
```

---

## Testing

### Test Change Password

1. Register/login to get JWT token
2. Call change-password endpoint with valid current password
3. Verify success response
4. Try logging in with new password
5. Test error cases:
   - Wrong current password
   - Mismatched new passwords
   - Same password as current
   - Invalid token

### Test Forgot Password

1. Call forgot-password with registered email
2. Check email inbox for reset link
3. Verify token in database with expiration
4. Test with non-existent email (should return same message)
5. Test email service errors

### Test Reset Password

1. Generate token via forgot-password
2. Use token to reset password
3. Verify password changed and token cleared
4. Try logging in with new password
5. Test error cases:
   - Invalid token
   - Expired token (after 24h)
   - Mismatched passwords
   - Same password as before
   - Already used token

---

## Environment Variables

Required environment variables:

```env
# Application URL for email links
APP_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Email Configuration (already configured)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@oots.com
```

---

## Frontend Integration Example

### Change Password Component

```typescript
async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  try {
    const response = await fetch('/api/v1/auth/change-password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}
```

### Forgot Password Component

```typescript
async function forgotPassword(email: string) {
  try {
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
}
```

### Reset Password Component

```typescript
async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
) {
  try {
    const response = await fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}
```

---

## Production Deployment Checklist

- [ ] Run migration SQL script to add new database columns
- [ ] Verify email service configuration (SMTP credentials)
- [ ] Set correct APP_URL environment variable
- [ ] Test email delivery in production environment
- [ ] Verify frontend reset password page exists at `/reset-password`
- [ ] Test complete flows in production
- [ ] Monitor logs for errors
- [ ] Set up email monitoring/alerts

---

## Support

For issues or questions, contact the development team.

**Version:** 1.0  
**Last Updated:** 2024  
**API Version:** v1
