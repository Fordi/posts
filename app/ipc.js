const { contextBridge } = require('electron');

const ipc = require('electron').ipcRenderer;

ipc.invoke('getApi').then((result) => {
  const API = {};
  Object.keys(result).forEach((key) => {
    API[key] = async (...args) => await ipc.invoke(key, ...args);
  });
  ipc.on('storage', (event, detail) => {
    window.dispatchEvent(new StorageEvent('storage', detail));
  });
  contextBridge.exposeInMainWorld('API', API);
});