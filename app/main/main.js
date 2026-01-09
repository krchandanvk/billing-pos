const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const { initDb, dbFunctions } = require("./db");
const { menuData } = require("./seedData");

// Initialize Database
initDb();
dbFunctions.seedMenu(menuData);
dbFunctions.pruneOldData(); // Auto-delete history older than 30 days

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

    // 2. Generate Filename: Just bill number as JPG (e.g., "01.jpg")
    const filename = `${billData.billNo || 'DRAFT'}.jpg`;
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

        setTimeout(async () => {
          try {
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
                dbFunctions.addBill(billToSave, billData.items);
                } catch (dbErr) {
                console.error("Failed to archive bill:", dbErr);
                }
            } else {
                console.log("Reprinting existing bill - skipping DB save.");
            }

            // Return path to renderer immediately after saving
            resolve({ success: true, path: filePath });

            // 7. Trigger Thermal Print
            printWin.webContents.print({ silent: false, printBackground: true }, () => {
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
    width: 350, // Increased width to prevent wrapping
    height: 1500,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  // Use a simple HTML template for KOT
  const kotHtml = `
    <html>
      <body style="font-family: 'Courier New'; width: 300px; padding: 5px; color: black; background: white;">
        <div style="text-align: center; font-size: 24px; font-weight: 900; margin: 10px 0; border: 2px solid black; padding: 5px;">TABLE #: ${kotData.tableNo || 'N/A'}</div>
        <div style="text-align: center; font-size: 12px; margin-bottom: 5px;">${new Date().toLocaleTimeString()}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead style="border-bottom: 1px dashed black;">
            <tr style="text-align: left;">
              <th>ITEM</th>
              <th style="text-align: right;">QTY</th>
            </tr>
          </thead>
          <tbody>
            ${kotData.items.map(it => `
              <tr>
                <td style="padding: 5px 0;">${it.name.toUpperCase()}</td>
                <td style="text-align: right;">${it.qty}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="border-top: 2px solid black; margin-top: 10px; padding-top: 5px; text-align: center; font-size: 11px;">SEND TO KITCHEN</div>
      </body>
    </html>
  `;

  printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(kotHtml)}`);
  
  printWin.webContents.once("did-finish-load", () => {
    printWin.webContents.print({ silent: false, printBackground: true }, () => {
      printWin.close();
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

// Menu IPC Handlers
ipcMain.handle("db:get-categories", () => dbFunctions.getCategories());
ipcMain.handle("db:add-category", (e, data) => dbFunctions.addCategory(data));
ipcMain.handle("db:update-category", (e, id, data) => dbFunctions.updateCategory(id, data));
ipcMain.handle("db:delete-category", (e, id) => dbFunctions.deleteCategory(id));

ipcMain.handle("db:get-menu-items", (e, categoryId) => dbFunctions.getMenuItems(categoryId));
ipcMain.handle("db:add-menu-item", (e, data) => dbFunctions.addMenuItem(data));
ipcMain.handle("db:update-menu-item", (e, id, data) => dbFunctions.updateMenuItem(id, data));
ipcMain.handle("db:delete-menu-item", (e, id) => dbFunctions.deleteMenuItem(id));
