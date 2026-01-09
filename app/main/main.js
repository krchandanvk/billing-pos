const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { initDb, dbFunctions } = require("./db");
const { menuData } = require("../renderer/data/menu");

// Initialize Database
initDb();
dbFunctions.seedMenu(menuData);

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

ipcMain.handle("print-bill", async (event, billData) => {
  // 1. Setup Save Directory
  const saveDir = path.join(app.getPath('documents'), 'kallos bill');
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  // 2. Generate Filename: Bill-[No]-[Amount]-[Date].jpg
  // Date format: DD-MM-YYYY
  const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const filename = `Bill-${billData.billNo || '23'}-${Math.round(billData.total)}-${dateStr}.jpg`;
  const filePath = path.join(saveDir, filename);

  // 3. Create Hidden Window (Tall enough to capture long bills)
  const printWin = new BrowserWindow({
    show: false,
    width: 350, // Slightly wider than 300px content to avoid scrollbars
    height: 2500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  printWin.loadFile(path.join(__dirname, "../renderer/receipt.html"));

  printWin.webContents.once("did-finish-load", async () => {
    // 4. Inject Data
    await printWin.webContents.executeJavaScript(`
      window.billData = ${JSON.stringify(billData)};
      // Trigger render immediately just in case
      if (typeof renderBill === 'function') renderBill();
    `);

    // Give a small buffer for DOM updates (images, layout)
    setTimeout(async () => {
      try {
        // 5. Capture Page as JPG
        const image = await printWin.webContents.capturePage();
        const jpegData = image.toJPEG(80); // 80% quality is good for receipts

        // 6. Save File
        fs.writeFileSync(filePath, jpegData);
        console.log("Bill saved to:", filePath);

        // 6.5 Save to Database (Archiving)
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
          console.log("Bill archived in database.");
        } catch (dbErr) {
          console.error("Failed to archive bill in database:", dbErr);
        }

        // 7. Trigger Thermal Print
        printWin.webContents.print({ silent: false, printBackground: true }, (success, err) => {
          if (!success) console.error("Print failed:", err);
          // Close window after print dialog is handled/closed
          // Note: If using silent:false, this callback runs after dialog closes.
          printWin.close();
        });

      } catch (err) {
        console.error("Error saving bill:", err);
        printWin.close();
      }
    }, 500); // 500ms render buffer
  });
});

app.whenReady().then(createWindow);

// Database IPC Handlers
ipcMain.handle("db:get-customers", () => dbFunctions.getCustomers());
ipcMain.handle("db:add-customer", (e, data) => dbFunctions.addCustomer(data));
ipcMain.handle("db:get-bills", (e, limit) => dbFunctions.getBills(limit));
ipcMain.handle("db:get-bill-items", (e, billId) => dbFunctions.getBillItems(billId));
ipcMain.handle("db:get-daily-stats", () => dbFunctions.getDailyStats());
ipcMain.handle("db:get-sales-data", (e, period) => dbFunctions.getSalesData(period));
ipcMain.handle("db:get-category-sales", () => dbFunctions.getCategorySales());
ipcMain.handle("db:get-top-selling-items", (e, limit) => dbFunctions.getTopSellingItems(limit));
ipcMain.handle("db:get-hourly-sales", () => dbFunctions.getHourlySales());

// Menu IPC Handlers
ipcMain.handle("db:get-categories", () => dbFunctions.getCategories());
ipcMain.handle("db:add-category", (e, data) => dbFunctions.addCategory(data));
ipcMain.handle("db:update-category", (e, id, data) => dbFunctions.updateCategory(id, data));
ipcMain.handle("db:delete-category", (e, id) => dbFunctions.deleteCategory(id));

ipcMain.handle("db:get-menu-items", (e, categoryId) => dbFunctions.getMenuItems(categoryId));
ipcMain.handle("db:add-menu-item", (e, data) => dbFunctions.addMenuItem(data));
ipcMain.handle("db:update-menu-item", (e, id, data) => dbFunctions.updateMenuItem(id, data));
ipcMain.handle("db:delete-menu-item", (e, id) => dbFunctions.deleteMenuItem(id));
