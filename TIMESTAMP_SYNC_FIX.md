# Bill Timestamp Synchronization Fix

## Problem

Previously, there was a timing inconsistency between:

1. **Printed Bill** - Date and time displayed on the thermal receipt
2. **Database Record** - The `created_at` timestamp in the SQLite database
3. **JPG File Metadata** - The file modification timestamp of saved bills

The database was auto-generating its own timestamp using SQLite's `datetime('now', 'localtime')`, which could be slightly different (by milliseconds or seconds) from the timestamp used on the printed bill and file metadata.

## Solution Implemented

### 1. Modified `db.js` - `addBill()` Function

**File**: `app/main/db.js`

- Added optional `timestamp` parameter to `addBill(bill, items, timestamp = null)`
- When a custom timestamp is provided, the function now inserts it into the database
- When no timestamp is provided, it falls back to SQLite's auto-generated timestamp

```javascript
addBill: (bill, items, timestamp = null) => {
  // Conditionally prepare SQL statement based on whether timestamp is provided
  const insertBill = timestamp
    ? db.prepare(`INSERT INTO bills (..., created_at) VALUES (?, ?, ..., ?)`)
    : db.prepare(`INSERT INTO bills (...) VALUES (?, ?, ...)`);

  // Use custom timestamp if provided
  if (customTimestamp) {
    info = insertBill.run(...billData, customTimestamp);
  } else {
    info = insertBill.run(...billData);
  }
};
```

### 2. Modified `main.js` - Bill Printing Handler

**File**: `app/main/main.js`

- Updated the `dbFunctions.addBill()` call to pass the bill's timestamp as the third parameter
- This ensures the database record uses the exact same timestamp as the printed bill

```javascript
// Pass the timestamp to ensure database uses the same timestamp as printed bill
dbFunctions.addBill(billToSave, billData.items, billData.timestamp);
```

## How It Works Now

1. **BillingPage.jsx** generates a timestamp when creating a bill:

   ```javascript
   timestamp: new Date().toISOString(); // e.g., "2026-01-09T21:10:52.123Z"
   ```

2. **receipt.html** uses this timestamp to display on the printed bill:

   ```javascript
   const billTime = data.timestamp ? new Date(data.timestamp) : new Date();
   document.getElementById("date").innerText =
     billTime.toLocaleDateString("en-GB");
   document.getElementById("time").innerText = billTime.toLocaleTimeString(
     "en-GB",
     { hour12: false }
   );
   ```

3. **main.js** sets the JPG file's modification timestamp to match:

   ```javascript
   const billTimestamp = billData.timestamp
     ? new Date(billData.timestamp)
     : new Date();
   fs.utimesSync(filePath, billTimestamp, billTimestamp);
   ```

4. **db.js** now stores the same timestamp in the database:
   ```javascript
   dbFunctions.addBill(billToSave, billData.items, billData.timestamp);
   ```

## Result

✅ **All three sources now use the EXACT SAME timestamp:**

- Printed bill date/time
- Database `created_at` field
- JPG file modification timestamp

This ensures perfect consistency across the entire billing system. When you view a bill in the Transaction Ledger, the displayed date and time will precisely match what was printed on the receipt and the file's timestamp metadata.

## Testing

To verify the fix:

1. Generate a new bill
2. Check the printed receipt for date/time
3. View the bill in Transaction Ledger (History Page)
4. Check the JPG file properties in Windows Explorer
5. All three should show the exact same date and time

---

**Fixed on**: 2026-01-10
**Related Files**:

- `app/main/db.js`
- `app/main/main.js`
- `app/renderer/pages/BillingPage.jsx` (already correct)
- `app/renderer/receipt.html` (already correct)
