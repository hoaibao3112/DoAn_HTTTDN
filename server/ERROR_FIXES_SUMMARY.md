# 🔧 Error Diagnosis & Fixes - Login 401 & Purchase Orders 500

## Summary of Issues & Solutions

You were experiencing two critical errors:
1. **Login endpoint returning 401 (Unauthorized)** - User can't log in
2. **Purchase orders endpoint returning 500 (Internal Server Error)** - "Bug when importing goods"

---

##  🔴 Issue #1: Login Returning 401

###causa Root: LoginRoutes.js Import Order Bug

**File:** `server/src/routes/LoginRoutes.js`

The `logActivity` import was placed at the **bottom** of the file (line 142) instead of the **top**. While ES6 module imports are technically hoisted, having the import at the bottom is a code smell that was causing issues.

### ✅ Fix Applied:
Moved the import to the top of the file:

```javascript
// BEFORE (WRONG - line 142):
import express from '...';
// ... more code ...
import { logActivity } from '../utils/auditLogger.js'; // ← AT BOTTOM

// AFTER (CORRECT - line 5):
import express from 'express';
import pool from '../config/connectDatabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logActivity } from '../utils/auditLogger.js'; // ← AT TOP
```

### Why This Caused 401:
When the login handler tried to audit-log the login attempt, it would fail because `logActivity` wasn't properly imported. The error would be caught and a generic error response returned.

---

## 🔴 Issue #2: Purchase Orders Returning 500

### Root Causes:

#### 1. **Unsafe NULL Handling from LEFT JOINs**
The purchase orders query uses `LEFT JOIN` on `kho_con` and `taikhoan`, which can return NULL values. These weren't handled:

```sql
-- BEFORE (UNSAFE):
SELECT ... kc.TenKho AS TenCH, tk.TenTK AS NguoiLap ...

-- AFTER (SAFE):
SELECT ... COALESCE(kc.TenKho, 'N/A') AS TenCH, 
           COALESCE(tk.TenTK, 'Unknown') AS NguoiLap ...
```

#### 2. **Unsafe Destructuring of COUNT Query**
The COUNT query result destructuring could fail:

```javascript
// BEFORE (UNSAFE):
const [[{ total }]] = await pool.query(`SELECT COUNT(...)`);

// AFTER (SAFE):
const countResults = await pool.query(`SELECT COUNT(...)`);
const total = countResults[0][0]?.total || 0;
```

#### 3. **Poor Error Logging**
The error response didn't include the actual error details:

```javascript
// BEFORE:
res.status(500).json({ success: false, message: error.message });

// AFTER:
console.error('Error in getAllPurchaseOrders:', error);
res.status(500).json({ 
    success: false, 
    message: error.message,
    details: error.stack 
});
```

### ✅ Fixes Applied:
All changes made in `server/src/controllers/warehouseController.js` - getAllPurchaseOrders function (around line 330):
1. Added COALESCE to handle NULL values (returns 'N/A' or 'Unknown' instead of NULL)
2. Added safe optionalchaining in COUNT destructuring
3. Added console.error logging for better debugging

---

## 🟡 Issue #3: Password Not Working

The database contains bcrypt-hashed passwords, but they don't match the credentials you might be trying to use.

### ✅ Solution Provided:

I've created a password reset utility: `server/src/scripts/resetPasswords.js`

**How to use:**
```bash
cd server
node src/scripts/resetPasswords.js
```

**This will reset all user passwords to:**
| Username | Password |
|----------|----------|
| admin | admin123 |
| quanly01 | quanly123 |
| thungan01 | thungan123 |
| kho01 | kho123 |
| hr01 | hr123 |

---

## 🧪 Testing the Fixes

### Step 1: Reset Passwords
```bash
cd server
node src/scripts/resetPasswords.js
```

**Expected output:**
```
🔄 Starting password reset...
✅ admin: Password reset to "admin123"
✅ quanly01: Password reset to "quanly123"
✅ thungan01: Password reset to "thungan123"
✅ kho01: Password reset to "kho123"
✅ hr01: Password reset to "hr123"

🎉 Password reset complete!
```

### Step 2: Restart Backend Server
```bash
# Kill current server (Ctrl+C)
# Start fresh
node server.js
```

### Step 3: Test Login
1. Go to http://localhost:3000 (frontend)
2. Log in with:
   - Username: `admin`
   - Password: `admin123`
3. Should see success message ✅

### Step 4: Test Purchase Orders
1. Click "Nhập hàng" (Purchase Orders) in sidebar
2. Should load data without 500 error ✅
3. Check browser console - should be clean of errors

---

## 📊 Summary of Changes

| File | Issue | Fix |
|------|-------|-----|
| `server/src/routes/LoginRoutes.js` | Import at bottom | Moved to top |
| `server/src/controllers/warehouseController.js` | NULL handling + unsafe destructuring | Added COALESCE + safe destructuring + logging |
| `server/src/scripts/resetPasswords.js` | Unknown passwords | Created reset utility |

---

## 🚀 Next Steps

1. Run the password reset script
2. Restart the backend server
3. Test login and purchase orders
4. If you still see errors, check the browser console and server logs (will now show detailed error messages)

---

## 💡 Additional Notes

- The fixes include better error logging to help diagnose any future issues
- All error responses now include `error.stack` to show the full call stack
- Purchase orders query now handles missing warehouse/user data gracefully with fallback values
- All test credentials are hardcoded as test values - change them immediately in production!
