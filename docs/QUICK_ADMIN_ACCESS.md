# Quick Start: Accessing Admin Panel

## Step-by-Step Instructions

### 1. Login to Your Account
- Visit: `http://localhost:3000/login`
- Enter your credentials
- Make sure you're logged in

### 2. Check Your Current Role
Visit your Supabase dashboard and run:
```sql
SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';
```

### 3. Set Admin Role (If Not Already Admin)
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### 4. Access Admin Panel

**Option A: Direct URL**
```
http://localhost:3000/admin/jobs
```

**Option B: From Dashboard (Recommended)**
After setting admin role, visit your dashboard and you'll see:
- A red **"Admin"** button in the top navigation (desktop)
- An **"Admin Panel"** link in the mobile menu (hamburger)

Click it to access the admin panel!

## What You'll See

### Desktop View
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Dashboard  Overview  Applications  Settings     │
│                                    [Admin] [User] [⋮]  │
└─────────────────────────────────────────────────────────┘
```

The **Admin** button appears in red, between Settings and your role badge.

### Mobile View
```
☰ (hamburger menu)

Opens:
┌──────────────────────┐
│ [User]               │
│ Overview             │
│ Applications         │
│ Settings             │
│ 🛡️ Admin Panel       │ ← Only for admins
│ ──────────────────── │
│ Sign Out             │
└──────────────────────┘
```

### Admin Panel
Once inside `/admin/jobs`:
```
┌─────────────────────────────────────┐
│ Admin Panel | Jobs                  │
├──────────┼──────────────────────────┤
│ Jobs     │ [Job Management Table]   │
│          │ - Approve/Reject jobs    │
│ Learning │ - Edit listings          │
│          │ - Delete jobs            │
└──────────┴──────────────────────────┘
```

## Troubleshooting

### ❌ "I don't see the Admin button"
**Solution:** Your role is not set to 'admin'
```sql
-- Fix: Update your role
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';
```

### ❌ "I'm redirected to /dashboard"
**Cause:** You're not an admin
**Solution:** Same as above - update your role in the database

### ❌ "I'm redirected to /login"
**Cause:** You're not logged in
**Solution:** Log in at `/login` first

### ✅ "I can access /admin/jobs"
**Success!** You have admin access. You should see:
- Admin sidebar on the left
- Job management interface
- "Administrator" badge in the sidebar

## SQL Quick Reference

```sql
-- Find your user ID
SELECT id, email FROM auth.users LIMIT 5;

-- Check your role
SELECT role FROM user_profiles WHERE id = 'your-uuid';

-- Become admin
UPDATE user_profiles SET role = 'admin' WHERE id = 'your-uuid';

-- Verify
SELECT role FROM user_profiles WHERE id = 'your-uuid';

-- Revoke admin (if needed)
UPDATE user_profiles SET role = 'user' WHERE id = 'your-uuid';
```

## Security Notes

⚠️ **Important:** 
- Admin routes are protected server-side
- Non-admin users are automatically redirected
- The Admin button only renders for users with `role = 'admin'`
- Protection happens in `src/app/admin/layout.tsx` via `requireAdmin()`

## Admin Features Available

### `/admin/jobs`
✅ View all jobs (approved + pending)
✅ Approve job submissions
✅ Reject job submissions  
✅ Delete jobs
✅ Edit job details

### `/admin/learning/new`
✅ Create new learning modules
✅ Manage educational content
✅ Upload materials

## Visual Flow

```
User Login
    ↓
Check Role in DB
    ↓
┌─────────────┬──────────────┐
│   Admin     │   Not Admin  │
├─────────────┼──────────────┤
│ See Admin   │ No Admin     │
│ Button      │ Button       │
│             │              │
│ Click →     │ Try URL →    │
│ Admin Panel │ Redirected!  │
└─────────────┴──────────────┘
```

## Next Steps

Once you have admin access:
1. Explore the job management interface
2. Review pending job submissions
3. Create learning modules
4. Manage user content
5. Monitor platform activity

---

**Need Help?** Check `docs/ADMIN_ACCESS.md` for detailed documentation
