const { BrowserWindow } = require('electron');

module.exports = function showOpenNotes() {
  BrowserWindow.getAllWindows().forEach((window) => {
    window.focus();
  });
};
