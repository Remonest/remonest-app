# Login/Logout Activity Tracking

Complete guide to the user login/logout activity tracking system in Remonest App.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
   - [Login Flow](#login-flow)
   - [Logout Flow](#logout-flow)
   - [OAuth Login Flow](#oauth-login-flow)
3. [What Gets Logged](#what-gets-logged)
4. [Database Functions](#database-functions)
5. [Viewing Activity in Admin Panel](#viewing-activity-in-admin-panel)
6. [Security & Privacy](#security--privacy)
7. [Query Examples](#query-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The login/logout activity tracking system automatically logs **every user authentication event** in the platform. This provides admins with complete visibility into when and how users access the system.

### Key Features

✅ **Automatic Logging** - No manual intervention needed
✅ **IP Address Tracking** - Captures user's IP from HTTP headers
✅ **User Agent Tracking** - Logs browser/client information
✅ **Login Method Detection** - Distinguishes email/password vs OAuth
✅ **Role Tracking** - Logs user role at time of login
✅ **Non-Blocking** - Login/logout succeeds even if logging fails
✅ **Admin Visibility** - Viewable in `/admin/activity-log`

---

## How It Works

### Login Flow

```
User visits /login
    ↓
Enters email and password
    ↓
Clicks "Login" button
    ↓
Server action validates credentials with Supabase Auth
    ↓
Authentication succeeds
    ↓
🔒 CAPTURE REQUEST HEADERS
    ├── IP Address: x-forwarded-for or x-real-ip
    └── User-Agent: browser/client info
    ↓
🔒 FETCH USER ROLE
    └── Query user_profiles table for role
    ↓
🔒 LOG LOGIN ACTIVITY
    └── Call log_user_login() database function
    ↓
Redirect to dashboard
```

### Logout Flow

```
User clicks "Sign Out" button
    ↓
Logout action triggered
    ↓
🔒 GET CURRENT USER
    └── Call supabase.auth.getUser()
    ↓
🔒 CAPTURE REQUEST HEADERS
    ├── IP Address
    └── User-Agent
    ↓
🔒 FETCH USER ROLE
    └── Query user_profiles table
    ↓
🔒 LOG LOGOUT ACTIVITY
    └── Call log_user_logout() database function
    ↓
Call supabase.auth.signOut()
    ↓
Redirect to home page
```

### OAuth Login Flow

```
User clicks "Login with Google"
    ↓
Redirect to Google OAuth
    ↓
User authenticates with Google
    ↓
Redirect back to /auth/callback
    ↓
Server exchanges code for session
    ↓
🔒 CAPTURE REQUEST HEADERS
    ├── IP Address (from NextRequest object)
    └── User-Agent
    ↓
🔒 FETCH USER ROLE
    └── Query user_profiles table
    ↓
🔒 LOG LOGIN ACTIVITY
    └── Call log_user_login() database function
    ↓
Redirect to dashboard
```

---

## What Gets Logged

### Login Events

| Field | Location | Example |
|-------|----------|---------|
| User ID | `admin_id` | `abc123-uuid-...` |
| Email | `new_values.email` | `user@example.com` |
| Role | `new_values.role` | `client`, `user`, `admin` |
| Login Method | `new_values.login_method` | `email/password` or `oauth` |
| IP Address | `ip_address` column | `192.168.1.100` |
| User Agent | `user_agent` column | `Mozilla/5.0 (Windows NT 10.0; ...)` |
| Timestamp | `created_at` | `2026-04-11 14:30:00` |
| Notes | `notes` | `"User logged in"` |

### Logout Events

| Field | Location | Example |
|-------|----------|---------|
| User ID | `admin_id` | `abc123-uuid-...` |
| Email | `old_values.email` | `user@example.com` |
| Role | `old_values.role` | `client`, `user`, `admin` |
| IP Address | `ip_address` column | `192.168.1.100` |
| User Agent | `user_agent` column | `Mozilla/5.0 (Windows NT 10.0; ...)` |
| Timestamp | `created_at` | `2026-04-11 15:30:00` |
| Notes | `notes` | `"User logged out"` |

---

## Database Functions

### log_user_login()

Logs a user login event to the `admin_actions` table.

**Signature:**
```sql
log_user_login(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
```

**Parameters:**
- `p_user_id` - The user's UUID
- `p_email` - The user's email address
- `p_role` - The user's role (admin/user/client)
- `p_ip_address` - Optional IP address from request headers
- `p_user_agent` - Optional User-Agent string

**Returns:** UUID of the created admin_actions record

**Example Usage:**
```sql
SELECT log_user_login(
  p_user_id := 'user-uuid',
  p_email := 'user@example.com',
  p_role := 'client',
  p_ip_address := '192.168.1.100',
  p_user_agent := 'Mozilla/5.0...'
);
```

**What It Does:**
1. Creates JSONB object with email, role, and login_method
2. Detects login method based on IP presence (IP = email/password, NULL = oauth)
3. Inserts record into `admin_actions` table
4. Returns the new action's UUID

---

### log_user_logout()

Logs a user logout event to the `admin_actions` table.

**Signature:**
```sql
log_user_logout(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
```

**Parameters:** Same as `log_user_login()`

**Returns:** UUID of the created admin_actions record

**Example Usage:**
```sql
SELECT log_user_logout(
  p_user_id := 'user-uuid',
  p_email := 'user@example.com',
  p_role := 'client',
  p_ip_address := '192.168.1.100',
  p_user_agent := 'Mozilla/5.0...'
);
```

**What It Does:**
1. Creates JSONB object with email and role (stored in old_values)
2. Inserts record into `admin_actions` table
3. Returns the new action's UUID

---

## Viewing Activity in Admin Panel

### Admin Activity Log Page

Navigate to `/admin/activity-log` to view all login/logout activity.

**What You'll See:**
- **Login Badge**: Blue "Login" badge
- **Logout Badge**: Gray "Logout" badge
- **User Info**: Name and email of the user
- **Timestamp**: Relative time (e.g., "2 hours ago")
- **IP Address**: Displayed with "IP:" label in monospace font
- **Browser Info**: User agent string with "Browser:" label

**Filtering:**
- Use the stats cards to see total counts
- Filter by action type (login/logout)
- Search by user name or email

**Example Display:**
```
┌─────────────────────────────────────────┐
│ [🟦 Login]                    2 min ago │
│ Oleh: John Doe (john@example.com)       │
│ IP: 192.168.1.100                       │
│ Browser: Mozilla/5.0 (Windows NT...)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ [⬜ Logout]                   5 min ago  │
│ Oleh: Jane Smith (jane@example.com)     │
│ IP: 10.0.0.50                           │
│ Browser: Mozilla/5.0 (Macintosh...)     │
└─────────────────────────────────────────┘
```

---

## Security & Privacy

### Why We Log Login/Logout

1. **Security Monitoring** - Detect suspicious activity
2. **Compliance** - Meet audit requirements
3. **Debugging** - Track down authentication issues
4. **Analytics** - Understand user behavior patterns

### Data Protection

- **Admin Only** - Only users with `role = 'admin'` can view activity logs
- **RLS Protected** - Row-level security prevents unauthorized access
- **Immutable** - Records cannot be modified or deleted
- **No Public Exposure** - IP addresses and user agents never shown to regular users

### Privacy Considerations

- IP addresses are logged for security purposes only
- User agent strings help identify browsers and devices
- Data is retained indefinitely for audit trail
- Used only for legitimate security and compliance purposes

---

## Query Examples

### Recent Login Activity

```sql
-- Show last 50 login/logout events with user details
SELECT 
  aa.admin_id,
  up.full_name,
  up.email,
  aa.action_type,
  aa.ip_address,
  aa.user_agent,
  aa.new_values->>'login_method' AS login_method,
  aa.created_at
FROM admin_actions aa
LEFT JOIN user_profiles up ON aa.admin_id = up.id
WHERE aa.action_type IN ('login', 'logout')
ORDER BY aa.created_at DESC
LIMIT 50;
```

### Login History for Specific User

```sql
-- Get all login events for a specific user
SELECT 
  aa.action_type,
  aa.ip_address,
  aa.user_agent,
  aa.new_values->>'login_method' AS login_method,
  aa.created_at
FROM admin_actions aa
WHERE aa.admin_id = 'user-uuid'
  AND aa.action_type = 'login'
ORDER BY aa.created_at DESC;
```

### Logins by Role

```sql
-- Count logins by user role
SELECT 
  aa.new_values->>'role' AS user_role,
  COUNT(*) AS login_count,
  MIN(aa.created_at) AS first_login,
  MAX(aa.created_at) AS last_login
FROM admin_actions aa
WHERE aa.action_type = 'login'
GROUP BY aa.new_values->>'role'
ORDER BY login_count DESC;
```

### Detect Multiple IPs for Same User

```sql
-- Find users logging in from multiple IP addresses
SELECT 
  up.full_name,
  up.email,
  COUNT(DISTINCT aa.ip_address) AS unique_ips,
  ARRAY_AGG(DISTINCT aa.ip_address) AS ip_addresses
FROM admin_actions aa
LEFT JOIN user_profiles up ON aa.admin_id = up.id
WHERE aa.action_type = 'login'
  AND aa.ip_address IS NOT NULL
GROUP BY up.full_name, up.email
HAVING COUNT(DISTINCT aa.ip_address) > 3
ORDER BY unique_ips DESC;
```

### Recent Failed Login Pattern

```sql
-- If you add error tracking later, you can query:
SELECT * FROM admin_actions
WHERE action_type = 'login'
  AND notes LIKE '%error%'
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Login/Logout Not Being Logged

**Possible Causes:**
1. **Database function missing** - Ensure Migration 017 is applied
2. **RPC call failing** - Check server logs for errors
3. **Headers not available** - IP/User-Agent capture may fail in some environments

**Debug Steps:**
```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('log_user_login', 'log_user_logout');

-- Check recent login/logout records
SELECT * FROM admin_actions 
WHERE action_type IN ('login', 'logout') 
ORDER BY created_at DESC 
LIMIT 10;
```

### IP Address Showing as NULL

**Why This Happens:**
- Behind proxy/load balancer that doesn't forward `x-forwarded-for`
- Local development (localhost doesn't have meaningful IP)
- Headers not configured correctly in deployment

**Solution:**
- Check your proxy configuration
- For local dev, IP will be NULL (this is expected)
- In production, ensure `x-forwarded-for` header is forwarded

### Enum Value Missing Error

**Error:** `invalid input value for enum admin_action_type_enum: "login"`

**Solution:**
```bash
# Apply Migration 017
supabase db push
```

Or manually add the enum values:
```sql
ALTER TYPE admin_action_type_enum ADD VALUE IF NOT EXISTS 'login';
ALTER TYPE admin_action_type_enum ADD VALUE IF NOT EXISTS 'logout';
```

---

## Related Documentation

- **[Admin Activity Logging Guide](./admin-action-logging.md)** - Complete admin action logging system
- **[Database Architecture](../architecture/database.md)** - Full database schema reference
- **[Migration 017](../../supabase/migrations/017_add_login_logout_activity_tracking.sql)** - Migration source code

---

**Last Updated:** April 11, 2026  
**Version:** 1.5.0  
**Status:** ✅ Active and Deployed
