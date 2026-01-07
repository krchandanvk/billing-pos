const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  printBill: (data) => ipcRenderer.invoke("print-bill", data),
  // Database Functions
  getCustomers: () => ipcRenderer.invoke("db:get-customers"),
  addCustomer: (data) => ipcRenderer.invoke("db:add-customer", data),
  getBills: (limit) => ipcRenderer.invoke("db:get-bills", limit),
  getBillItems: (billId) => ipcRenderer.invoke("db:get-bill-items", billId),
  getDailyStats: () => ipcRenderer.invoke("db:get-daily-stats")
});
