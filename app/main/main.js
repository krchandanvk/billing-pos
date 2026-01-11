const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require("electron");
Menu.setApplicationMenu(null); // Remove default menu bar (File, Edit, Help, etc.)
const path = require("path");
const { initDb, dbFunctions } = require("./db");
const { menuData } = require("./seedData");

// Initialize Database
initDb();
dbFunctions.seedMenu(menuData);
dbFunctions.pruneOldData(); // Resets analytics/sales yearly on 1st January

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../main/preload.js"), // Correct path based on structure
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

const fs = require('fs');

ipcMain.handle("print-bill", (event, billData) => {
  return new Promise((resolve, reject) => {
    // 1. Setup Save Directory
    const saveDir = path.join(app.getPath('documents'), 'Invoices');
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // 2. Generate Filename: BillNo_Date_Time.jpg (e.g., "68_09-Jan-2026_8-05pm.jpg")
    const billTimestamp = billData.timestamp ? new Date(billData.timestamp) : new Date();
    const dateStr = billTimestamp.toLocaleString('en-IN', { dateStyle: 'medium' }).replace(/\s/g, '-');
    const timeStr = billTimestamp.toLocaleString('en-IN', { timeStyle: 'short' }).replace(/\s/g, '').replace(':', '-').toLowerCase();
    
    const filename = `${billData.billNo || 'DRAFT'}_${dateStr}_${timeStr}.jpg`;
    const filePath = path.join(saveDir, filename);

    const printWin = new BrowserWindow({
      show: false,
      width: 350,
      height: 2500,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
    });

    printWin.loadFile(path.join(__dirname, "../renderer/receipt.html"));

    printWin.webContents.once("did-finish-load", async () => {
      try {
        await printWin.webContents.executeJavaScript(`
          window.billData = ${JSON.stringify(billData)};
          if (typeof renderBill === 'function') renderBill();
        `);

        // Wait for logo and fonts to fully render
        setTimeout(async () => {
          try {
            const height = await printWin.webContents.executeJavaScript('document.getElementById("receipt-container").getBoundingClientRect().height');
            const heightInPixels = Math.ceil(height) + 35; // Increased buffer for physical cutter
            printWin.setSize(320, heightInPixels); 

            // 5. Capture as JPG Image (thermal print style)
            const imageData = await printWin.webContents.capturePage();
            const jpgBuffer = imageData.toJPEG(95); // 95% quality
            
            // 6. Save File as JPG
            fs.writeFileSync(filePath, jpgBuffer);
            
            // 6.1 Set file timestamp to match bill date/time
            // Use billData.timestamp if provided, otherwise use current time
            const billTimestamp = billData.timestamp ? new Date(billData.timestamp) : new Date();
            fs.utimesSync(filePath, billTimestamp, billTimestamp);
            
            console.log("Bill saved as JPG with timestamp:", billTimestamp.toLocaleString(), filePath);

            // 6.5 Save to Database (ONLY IF NEW BILL)
            if (!billData.reprint) {
                try {
                const billToSave = {
                    bill_no: billData.billNo || '23',
                    customer_id: billData.customerId || null,
                    subtotal: billData.subtotal,
                    cgst: billData.cgst,
                    sgst: billData.sgst,
                    total: billData.total,
                    payment_mode: billData.paymentMode || 'Cash',
                    image_path: filePath
                };
                // Pass the timestamp to ensure database uses the same timestamp as printed bill
                dbFunctions.addBill(billToSave, billData.items, billData.timestamp);
                } catch (dbErr) {
                console.error("Failed to archive bill:", dbErr);
                }
            } else {
                console.log("Reprinting existing bill - skipping DB save.");
            }

            // Return path to renderer immediately after saving
            resolve({ success: true, path: filePath });

            // 7. Trigger Thermal Print
            const heightInMicrons = Math.floor(heightInPixels * 264.58); // convert px to microns for Electron's pageSize
            
            printWin.webContents.print({ 
              silent: false, 
              printBackground: true,
              margins: { marginType: 'none' },
              pageSize: {
                width: 80000, // 80mm
                height: heightInMicrons
              }
            }, () => {
              printWin.close();
            });

          } catch (err) {
            console.error("Error saving bill:", err);
            printWin.close();
            reject(err);
          }
        }, 500);
      } catch (err) {
        printWin.close();
        reject(err);
      }
    });

    // Handle window load errors
    printWin.webContents.on('did-fail-load', (e, code, desc) => {
        reject(new Error(`Failed to load receipt template: ${desc}`));
        printWin.close();
    });
  });
});

ipcMain.handle("sys:backup-data", async () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(app.getPath('documents'), 'BillingBackups', `Backup_${timestamp}`);
        console.log("Creating backup at:", backupDir);
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        // Copy Database
        const dbPath = path.join(app.getPath("userData"), "pos_system.db");
        if(fs.existsSync(dbPath)) fs.copyFileSync(dbPath, path.join(backupDir, "pos_system.db"));

        // Copy Invoices
        const invoicesPath = path.join(app.getPath('documents'), 'Invoices');
        const invoicesDest = path.join(backupDir, 'Invoices');
        console.log("Invoices source:", invoicesPath);
        if(fs.existsSync(invoicesPath)) {
            const files = fs.readdirSync(invoicesPath);
            console.log(`Found ${files.length} invoice files`);
            // Recursive copy for Node 16+
            fs.cpSync(invoicesPath, invoicesDest, { recursive: true });
            console.log("✅ Invoices copied successfully");
        } else {
            console.warn("⚠️ Invoices folder not found");
        }
        
        return { success: true, path: backupDir };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle("sys:export-sales-csv", async () => {
    try {
        const bills = dbFunctions.getBills(100000); // Get all bills
        let csvContent = "BillNo,Date,Customer,Subtotal,GST,Total,PaymentMode\n";
        
        bills.forEach(b => {
            const row = [
                b.bill_no,
                new Date(b.created_at).toLocaleString(),
                b.customer_name || 'Guest',
                b.subtotal,
                (b.cgst + b.sgst),
                b.total,
                b.payment_mode
            ].map(f => `"${f}"`).join(",");
            csvContent += row + "\n";
        });

        const { filePath } = await dialog.showSaveDialog({
            buttonLabel: 'Export CSV',
            defaultPath: `Sales_Export_${new Date().toISOString().split('T')[0]}.csv`
        });

        if (filePath) {
            fs.writeFileSync(filePath, csvContent);
            return { success: true, path: filePath };
        }
        return { success: false };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle("sys:open-data-folder", () => {
    shell.openPath(path.join(app.getPath('documents'), 'BillingBackups'));
});

ipcMain.handle("print-kot", async (event, kotData) => {
  const printWin = new BrowserWindow({
    show: false,
    width: 320,
    height: 1500,
    webPreferences: { 
        nodeIntegration: false, 
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js")
    }
  });

  const kotPath = path.join(__dirname, "../renderer/kot.html");
  printWin.loadFile(kotPath);

  return new Promise((resolve, reject) => {
    printWin.webContents.once("did-finish-load", async () => {
      try {
        // 1. Inject Data and Render
        await printWin.webContents.executeJavaScript(`
          if (typeof renderKOT === 'function') renderKOT(${JSON.stringify(kotData)});
        `);

        // 2. Wait for rendering
        setTimeout(async () => {
          try {
            const height = await printWin.webContents.executeJavaScript('document.getElementById("kot-container").getBoundingClientRect().height');
            const heightInPixels = Math.ceil(height) + 35;
            printWin.setSize(320, heightInPixels);

            // 3. Capture as JPG
            const kotDir = path.join(app.getPath('documents'), 'KOTs');
            if (!fs.existsSync(kotDir)) fs.mkdirSync(kotDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const fileName = `KOT_Table_${kotData.tableNo || 'NA'}_${timestamp}.jpg`;
            const filePath = path.join(kotDir, fileName);

            const imageData = await printWin.webContents.capturePage();
            fs.writeFileSync(filePath, imageData.toJPEG(95));

            // 4. Print
            const heightInMicrons = Math.floor(heightInPixels * 264.58);
            printWin.webContents.print({
              silent: false,
              printBackground: true,
              margins: { marginType: 'none' },
              pageSize: { width: 80000, height: heightInMicrons }
            }, () => {
              printWin.close();
              resolve({ success: true, path: filePath });
            });

          } catch (err) {
            console.error("KOT Capture Error:", err);
            printWin.close();
            reject(err);
          }
        }, 800);

      } catch (err) {
        printWin.close();
        reject(err);
      }
    });
  });
});

app.whenReady().then(createWindow);

// Database IPC Handlers
ipcMain.handle("db:get-customers", () => dbFunctions.getCustomers());
ipcMain.handle("db:add-customer", (e, data) => dbFunctions.addCustomer(data));
ipcMain.handle("db:get-bills", (e, limit) => dbFunctions.getBills(limit));
ipcMain.handle("db:get-bill-items", (e, billId) => dbFunctions.getBillItems(billId));
ipcMain.handle("db:get-daily-stats", () => dbFunctions.getAdvancedAnalytics().daily);
ipcMain.handle("db:get-sales-data", (e, period) => dbFunctions.getSalesData(period));
ipcMain.handle("db:get-category-sales", () => dbFunctions.getCategorySales());
ipcMain.handle("db:get-top-selling-items", (e, limit) => dbFunctions.getTopSellingItems(limit));
ipcMain.handle("db:get-hourly-sales", () => dbFunctions.getHourlySales());
ipcMain.handle("db:get-advanced-analytics", () => dbFunctions.getAdvancedAnalytics());
ipcMain.handle("db:get-next-bill-no", () => dbFunctions.getNextBillNo());
ipcMain.handle("db:reset-bill-sequence", () => dbFunctions.resetBillSequence());
ipcMain.handle("db:set-bill-offset", (e, val) => dbFunctions.setBillOffset(val));
ipcMain.handle("db:get-bill-offset", () => dbFunctions.getBillOffset());

// Menu IPC Handlers
ipcMain.handle("db:get-categories", () => dbFunctions.getCategories());
ipcMain.handle("db:add-category", (e, data) => dbFunctions.addCategory(data));
ipcMain.handle("db:update-category", (e, id, data) => dbFunctions.updateCategory(id, data));
ipcMain.handle("db:delete-category", (e, id) => dbFunctions.deleteCategory(id));

ipcMain.handle("db:get-menu-items", (e, categoryId) => dbFunctions.getMenuItems(categoryId));
ipcMain.handle("db:add-menu-item", (e, data) => dbFunctions.addMenuItem(data));
ipcMain.handle("db:update-menu-item", (e, id, data) => dbFunctions.updateMenuItem(id, data));
ipcMain.handle("db:delete-menu-item", (e, id) => dbFunctions.deleteMenuItem(id));
