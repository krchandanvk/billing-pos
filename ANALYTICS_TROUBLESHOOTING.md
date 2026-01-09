# Analytics Troubleshooting Guide

## Issue: Analytics showing all zeros

### Possible Causes:

1. **No Bills in Database**

   - The analytics will show 0 if there are no bills created yet
   - **Solution**: Create some test bills first

2. **Date/Time Mismatch**

   - SQLite date functions might not match current date
   - **Solution**: Check console logs for actual data

3. **Database Connection Issue**
   - IPC handlers might not be working
   - **Solution**: Check browser console for errors

---

## How to Test Analytics

### Step 1: Create Test Data

1. Go to **Billing** page
2. Add some items to cart
3. Click **"Print Final Bill"**
4. Repeat 2-3 times to create multiple bills

### Step 2: Check Console

1. Open DevTools (F12)
2. Go to **Console** tab
3. Navigate to **Analytics** page
4. Look for these messages:
   ```
   Fetching analytics data...
   Advanced Stats received: {daily: {...}, weekly: {...}, ...}
   Hourly Sales received: [...]
   Top Items received: [...]
   ```

### Step 3: Verify Data

- If you see `count: 0` in all periods → No bills match the date criteria
- If you see actual numbers → Analytics are working correctly
- If you see errors → There's a database or IPC issue

---

## Expected Behavior

### With No Bills:

```javascript
{
  daily: { count: 0, total_sales: 0, cash_sales: 0, online_sales: 0 },
  weekly: { count: 0, total_sales: 0, cash_sales: 0, online_sales: 0 },
  monthly: { count: 0, total_sales: 0, cash_sales: 0, online_sales: 0 },
  yearly: { count: 0, total_sales: 0, cash_sales: 0, online_sales: 0 }
}
```

### With Bills Created Today:

```javascript
{
  daily: { count: 3, total_sales: 1500, cash_sales: 800, online_sales: 700 },
  weekly: { count: 3, total_sales: 1500, cash_sales: 800, online_sales: 700 },
  monthly: { count: 3, total_sales: 1500, cash_sales: 800, online_sales: 700 },
  yearly: { count: 3, total_sales: 1500, cash_sales: 800, online_sales: 700 }
}
```

---

## Quick Fix Checklist

- [ ] Restart the application
- [ ] Create at least 1 test bill
- [ ] Check browser console for errors
- [ ] Verify bills appear in **History** page
- [ ] Switch between Daily/Weekly/Monthly/Yearly tabs
- [ ] Check if "Revenue Trend" chart shows data

---

## If Still Not Working

### Check Database Directly

The database is located at:

```
C:\Users\ChandanKumar\AppData\Roaming\kallu-s-tandon-veg-pos\pos_system.db
```

You can open it with SQLite browser and run:

```sql
SELECT COUNT(*) FROM bills;
SELECT * FROM bills ORDER BY created_at DESC LIMIT 5;
```

### Check IPC Handlers

Look in the console for:

- "Fetching analytics data..." → Frontend is calling the API
- "Advanced Stats received:" → Backend is responding
- Any error messages → Shows what's failing

---

**Status:** Debugging enabled with console logs
**Last Updated:** 2026-01-10 00:26 IST
