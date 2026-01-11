const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  printBill: (data) => ipcRenderer.invoke("print-bill", data),
  printKOT: (data) => ipcRenderer.invoke("print-kot", data),
  // Database Functions
  getCustomers: () => ipcRenderer.invoke("db:get-customers"),
  addCustomer: (data) => ipcRenderer.invoke("db:add-customer", data),
  getBills: (limit) => ipcRenderer.invoke("db:get-bills", limit),
  getBillItems: (billId) => ipcRenderer.invoke("db:get-bill-items", billId),
  getDailyStats: () => ipcRenderer.invoke("db:get-daily-stats"),
  getSalesData: (period) => ipcRenderer.invoke("db:get-sales-data", period),
  getCategorySales: () => ipcRenderer.invoke("db:get-category-sales"),
  getTopSellingItems: (limit) => ipcRenderer.invoke("db:get-top-selling-items", limit),
  getHourlySales: () => ipcRenderer.invoke("db:get-hourly-sales"),
  getAdvancedAnalytics: () => ipcRenderer.invoke("db:get-advanced-analytics"),
  getNextBillNo: () => ipcRenderer.invoke("db:get-next-bill-no"),
  resetBillSequence: () => ipcRenderer.invoke("db:reset-bill-sequence"),
  // Menu Functions
  getCategories: () => ipcRenderer.invoke("db:get-categories"),
  addCategory: (data) => ipcRenderer.invoke("db:add-category", data),
  updateCategory: (id, data) => ipcRenderer.invoke("db:update-category", id, data),
  deleteCategory: (id) => ipcRenderer.invoke("db:delete-category", id),
  getMenuItems: (categoryId) => ipcRenderer.invoke("db:get-menu-items", categoryId),
  addMenuItem: (data) => ipcRenderer.invoke("db:add-menu-item", data),
  updateMenuItem: (id, data) => ipcRenderer.invoke("db:update-menu-item", id, data),
  deleteMenuItem: (id) => ipcRenderer.invoke("db:delete-menu-item", id),
  // Bill Sequence Functions
  getBillOffset: () => ipcRenderer.invoke("db:get-bill-offset"),
  setBillOffset: (val) => ipcRenderer.invoke("db:set-bill-offset", val),
  // System Functions
  backupData: () => ipcRenderer.invoke("sys:backup-data"),
  exportSalesCSV: () => ipcRenderer.invoke("sys:export-sales-csv"),
  openDataFolder: () => ipcRenderer.invoke("sys:open-data-folder")
});
