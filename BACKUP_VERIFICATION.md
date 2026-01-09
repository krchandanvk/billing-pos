# Backup Invoice Verification Guide

## Issue: Recent invoices not appearing in backup

### How to Verify Backup is Working

**Step 1: Check Console Logs**

1. Restart the application
2. Open DevTools (F12)
3. Go to **Settings** page
4. Click **"Create Backup Now"**
5. Check console for these messages:
   ```
   Creating backup at: C:\Users\...\Documents\BillingBackups\Backup_...
   Invoices source: C:\Users\...\Documents\Invoices
   Found X invoice files
   ✅ Invoices copied successfully
   ```

**Step 2: Verify Invoice Files Exist**

1. Open File Explorer
2. Navigate to: `C:\Users\ChandanKumar\Documents\Invoices`
3. Check if PDF files are there
4. Note the count of files

**Step 3: Check Backup Folder**

1. Navigate to: `C:\Users\ChandanKumar\Documents\BillingBackups`
2. Open the latest `Backup_YYYY-MM-DD...` folder
3. Check if `Invoices` subfolder exists
4. Verify the same number of PDFs are inside

---

## Common Issues & Solutions

### Issue 1: "Invoices folder not found"

**Cause:** No bills have been printed yet
**Solution:**

1. Go to Billing page
2. Create and print at least one bill
3. Try backup again

### Issue 2: Backup folder is empty

**Cause:** `fs.cpSync` might not be available in your Node version
**Solution:** Already using `fs.cpSync` which works in Node 16+

### Issue 3: Some invoices missing

**Cause:** Files might be locked or in use
**Solution:**

1. Close any PDF viewers
2. Try backup again

---

## Expected Folder Structure

```
Documents/
├── Invoices/
│   ├── 01_Amt-950_09-01-2026.pdf
│   ├── 02_Amt-1200_09-01-2026.pdf
│   └── 03_Amt-850_09-01-2026.pdf
│
└── BillingBackups/
    └── Backup_2026-01-10T00-30-00-000Z/
        ├── pos_system.db
        └── Invoices/
            ├── 01_Amt-950_09-01-2026.pdf
            ├── 02_Amt-1200_09-01-2026.pdf
            └── 03_Amt-850_09-01-2026.pdf
```

---

## Manual Verification Steps

1. **Count source files:**

   - Open `Documents\Invoices`
   - Count PDF files: **\_** files

2. **Create backup:**

   - Click "Create Backup Now"
   - Note the success message path

3. **Count backup files:**

   - Open the backup folder
   - Open `Invoices` subfolder
   - Count PDF files: **\_** files

4. **Compare:**
   - Source count should equal backup count ✅

---

## If Still Not Working

**Check the console for error messages:**

- "Invoices folder not found" → No invoices exist yet
- "Permission denied" → Run app as administrator
- Other errors → Report the exact error message

**Manual backup alternative:**

1. Copy `C:\Users\ChandanKumar\Documents\Invoices` folder
2. Paste to your backup location
3. Copy database from: `C:\Users\ChandanKumar\AppData\Roaming\kallu-s-tandon-veg-pos\pos_system.db`

---

**Status:** Backup logging enabled
**Last Updated:** 2026-01-10 00:30 IST
