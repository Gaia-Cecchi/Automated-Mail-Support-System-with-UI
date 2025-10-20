# Gmail Setup Guide for Mail Support System

This guide explains how to configure Gmail to work with the Mail Support System.

## ⚠️ Important: App Passwords Required

Gmail does **NOT** allow you to use your regular password for IMAP/SMTP access from third-party applications. You must create an **App Password**.

## 📋 Prerequisites

Before you start, you need:
1. A Gmail account
2. **2-Step Verification enabled** (required for App Passwords)

---

## 🔐 Step 1: Enable 2-Step Verification

If you haven't already enabled 2-Step Verification:

1. Go to your Google Account: https://myaccount.google.com
2. Click on **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup wizard to enable it (you'll need your phone)

---

## 🔑 Step 2: Generate App Password

Once 2-Step Verification is enabled:

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords

2. You may need to sign in again

3. Click on **"Select app"** dropdown:
   - Choose **"Mail"**

4. Click on **"Select device"** dropdown:
   - Choose **"Other (Custom name)"**
   - Type: `Mail Support System` or any name you prefer

5. Click **"Generate"**

6. Google will display a **16-character password** like: `abcd efgh ijkl mnop`
   - ⚠️ **IMPORTANT**: Copy this password immediately!
   - You won't be able to see it again
   - Remove spaces when pasting: `abcdefghijklmnop`

---

## ⚙️ Step 3: Configure the Application

### Option A: Using the GUI

1. Launch the GUI:
   ```bash
   python gui/app_gui_v2.py
   ```

2. In the "System Configuration" section, enter:
   - **Email Address**: `your-email@gmail.com`
   - **Password**: `abcdefghijklmnop` (the App Password from Step 2)
   - **IMAP Server**: `imap.gmail.com`
   - **SMTP Server**: `smtp.gmail.com`

3. Click **"Save Configuration"**

### Option B: Using .env file

Edit the `.env` file in the project root:

```properties
EMAIL=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
IMAP=imap.gmail.com
SMTP=smtp.gmail.com
```

⚠️ **Note**: Use the App Password (without spaces), NOT your regular Gmail password!

---

## ✅ Step 4: Test the Configuration

1. In the GUI, click **"📬 Check Mail"**
2. If configured correctly, you should see a message about checking emails
3. If you get an authentication error, verify:
   - App Password is correct (no spaces)
   - 2-Step Verification is enabled
   - You're using the App Password, not your regular password

---

## 🔧 Troubleshooting

### Error: "Authentication failed"
- ✅ Make sure you're using the **App Password**, not your regular Gmail password
- ✅ Check that the App Password has no spaces: `abcdefghijklmnop`
- ✅ Verify 2-Step Verification is enabled on your Google Account

### Error: "IMAP access is disabled"
1. Go to: https://mail.google.com/mail/u/0/#settings/fwdandpop
2. Under "IMAP Access", select **"Enable IMAP"**
3. Click **"Save Changes"**

### Error: "Less secure app access"
- This is no longer needed! Google removed this option.
- Use **App Passwords** instead (the modern, secure method)

### Can't find "App passwords" option
- Make sure **2-Step Verification is enabled** (required!)
- Some Google Workspace accounts may have this disabled by administrators

---

## 🔒 Security Notes

1. **App Passwords are safer** than "less secure apps" because:
   - They're unique per application
   - They can be revoked individually
   - They don't expose your main password

2. **Revoking an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Click on the app name
   - Click "Remove"
   - The application will immediately lose access

3. **Keep your App Password secret**:
   - Don't share it
   - Don't commit it to Git (it's in `.gitignore`)
   - Store it securely

---

## 📱 Other Email Providers

### Outlook / Hotmail / Live.com

Similar to Gmail:
1. Go to: https://account.microsoft.com/security
2. Enable 2-Step Verification
3. Create an App Password
4. Use these settings:
   - IMAP: `outlook.office365.com`
   - SMTP: `smtp.office365.com`

### Other Providers

Check your email provider's documentation for:
- IMAP server address
- SMTP server address
- Whether App Passwords or special credentials are required

---

## 🆘 Still Having Issues?

1. Check the logs in the GUI or terminal for specific error messages
2. Verify your internet connection
3. Try creating a new App Password
4. Check Google's status page: https://www.google.com/appsstatus

---

## ✅ Quick Reference

**Gmail Settings Summary**:
```
Email:    your-email@gmail.com
Password: [16-char App Password, no spaces]
IMAP:     imap.gmail.com
SMTP:     smtp.gmail.com
```

**App Password Generator**: https://myaccount.google.com/apppasswords

**Enable IMAP**: https://mail.google.com/mail/u/0/#settings/fwdandpop

---

**Note**: This guide is current as of October 2024. Google may update their security settings. Check their official documentation if steps don't match: https://support.google.com/accounts/answer/185833
