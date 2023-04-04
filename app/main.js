const { app, BrowserWindow, ipcMain } = require('electron');
const API = require('./API/index.js');
const { createTrayIcon, buildTrayMenu } = require('./Tray/index.js');
const features = require('./features.js');

API.init();

(async () => {
  await app.whenReady();
  await createTrayIcon();

  // Initialize features
  await Promise.all(features.map(async feature => await feature.init()));
  await buildTrayMenu(features);
})();

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  app.dock?.hide();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    API.newNote();
  }
});

app.rebuildTrayMenu = () => buildTrayMenu(features);

