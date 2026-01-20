# 🔐 MBOA Market - Login Credentials

## ✅ VERIFIED WORKING ACCOUNTS

These credentials have been tested and confirmed working with the backend API:

---

### Account 1: Seed Provider
```
Phone: +237670000001
Password: test123
Type: Fournisseur de Semences (Seed Provider)
Name: Test User
```
**Status**: ✅ Verified Working

---

### Account 2: Producer  
```
Phone: +237670000002
Password: prodpass123
Type: Producteur (Producer)
Name: Ferme Bio Cameroun
```
**Status**: ✅ Verified Working

---

## 📝 Important Login Instructions

### ⚠️ CRITICAL: Enter Phone Number EXACTLY

The phone number **MUST** include the `+` sign:
- ✅ **CORRECT**: `+237670000002`
- ❌ **WRONG**: `237670000002` (missing +)
- ❌ **WRONG**: `+237 670 000 002` (has spaces)
- ❌ **WRONG**: `+237-670-000-002` (has dashes)

### Password Requirements
- Passwords are case-sensitive
- No spaces before or after
- Enter exactly as shown

---

## 🧪 Testing Login

### Method 1: Direct Browser Test
1. Open: http://localhost:5173/login
2. Copy and paste the phone number: `+237670000002`
3. Copy and paste the password: `prodpass123`
4. Click "SE CONNECTER"

### Method 2: Test Page
1. Open: http://localhost:5173/test-login.html
2. Credentials are pre-filled
3. Click "Test Login"
4. See detailed response

### Method 3: Python Test Script
```bash
cd C:/Users/HP/Desktop/mboa-market
python test_exact_login.py
```

---

## 🔍 Troubleshooting 401 Errors

If you get "401 Unauthorized" error:

1. **Check the phone number format**
   - Must start with `+`
   - No spaces or dashes
   - Exactly: `+237670000002`

2. **Check the password**
   - Case-sensitive
   - Exactly: `prodpass123`
   - No extra spaces

3. **Clear browser cache**
   - Press Ctrl+Shift+R (hard refresh)
   - Or clear localStorage in DevTools

4. **Verify backend is running**
   - Check: http://localhost:8000/health
   - Should return: `{"status":"healthy"}`

---

## 🎯 Quick Copy-Paste

**Producer Account (Most Common):**
```
Phone: +237670000002
Password: prodpass123
```

**Seed Provider Account:**
```
Phone: +237670000001
Password: test123
```

---

## 📊 Backend Verification

The backend API has been tested and confirmed working:
- ✅ Registration endpoint: Working
- ✅ Login endpoint: Working
- ✅ Token generation: Working
- ✅ User authentication: Working

The issue is typically with how credentials are entered in the browser.

---

## 💡 Pro Tip

**Copy the credentials directly from this file** to avoid typos!

Right-click → Copy on the phone number and password, then paste into the login form.
