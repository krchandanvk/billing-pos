const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("bizness", {
  appName: "Bizness Billing POS"
});
