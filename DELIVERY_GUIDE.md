# Delivery & Deployment Guide for Kallu's Tandon POS

Congratulations on completing the setup! Follow this guide to smoothy hand over the software to the restaurant owner.

## 1. Installation on Restaurant PC

### Prerequisites

- Windows 10 or 11 Laptop/PC.
- Thermal Printer (USB).

### Steps to Install

1. **Build the Installer** (Do this on your dev machine):
   - Open your terminal in the project folder.
   - Run: `npm run build`
   - This will create a `.exe` installer in the `dist/` folder (e.g., `Kallus Tandon Veg POS Setup 1.0.0.exe`).
2. **Install on Client Machine**:
   - Copy the `.exe` file to the restaurant's computer (via Pen drive or WhatsApp).
   - Double-click to install. It will launch automatically.

---

## 2. Printer Setup (Crucial!)

The software relies on the **Default Printer** being the Thermal Printer.

1. Connect the Thermal Printer via USB.
2. Install the Printer Drivers (provided by the printer manufacturer).
3. Go to **Control Panel > Devices and Printers**.
4. Right-click the Thermal Printer and select **"Set as Default Printer"**.
5. **Test**: Open the POS App, make a dummy order, and click "Print Final Bill". It should print automatically without asking to save acts as a PDF backup, but the actual thermal print job usually goes to the default system printer or prompts depending on driver settings.
   - _Note: If the PDF save dialog pops up, tell them to just hit Enter, or we can configure "Silent Printing" further if needed._

---

## 3. Operations Manual (Training the Staff)

### A. taking an Order

1. Select the **Table Number** from the top bar (e.g., T-1).
2. Click **Category** buttons (e.g., "Chinese") to filter items.
3. Click items to add them. Use `+` / `-` buttons to adjust quantity.

### B. Sending to Kitchen (KOT)

1. Once the order is confirmed, click the purple **"ORDER TO KITCHEN"** button.
2. This prints a small slip for the chef.

### C. Final Billing

1. When the customer finishes, open their Table (T-1).
2. Click the green **"PRINT FINAL BILL"** button.
3. The table will automatically **Clear** after printing (ready for next customer).
4. A PDF copy is saved in `Documents/Invoices` automatically.

### D. Closing the Day (End of Day)

1. Go to **Dashboard** to see Total Sales.
2. (Optional) Click the **Refresh Button (🔄)** in the Bill ID section the next morning to reset the Bill Number to 1.

---

## 4. Maintenance & Support

- **Menu Changes**: Show the owner how to go to the **"Menu"** page to Add/Edit prices or delete items.
- **Backups**: The system auto-saves PDF copies of every bill in `Documents/Invoices`. Tell them **never to delete that folder** effectively acting as a record.
- **Support**: If the screen goes blank or freezes, simply close the app and reopen it. Data is safe in the database.

---

## 5. Handover Checklist

- [ ] App Installed & Shortcut on Desktop.
- [ ] Thermal Printer set as **Default**.
- [ ] Hotel Logo verified on Receipt.
- [ ] Test Bill Printed & Verified.
- [ ] "Invoices" folder location shown to Owner.
