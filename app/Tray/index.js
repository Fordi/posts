const { app, Tray, nativeImage, Menu, MenuItem } = require('electron');
const { join } = require('path');
const features = require('../features.js');

let appIcon = null;

const createTrayIcon = async (count) => {
  await app.whenReady();
  if (!appIcon) {
    const trayIcon = nativeImage.createFromPath(join(__dirname, './icon_20.png'));
    appIcon = new Tray(trayIcon);
    appIcon.setToolTip(`Psyc`);
    appIcon.setBadge = (n) => {
      // TODO: Copy `trayIcon` to another nativeImage
      // Draw the badge on the copy of `trayIcon` and call
      // appIcon.setImage(copy);
    };
    if (count) {
      appIcon.setBadge(count);
    }
  }
  return appIcon;
};

const buildTrayMenu = async () => {
  const trayIcon = await createTrayIcon();
  const menuItemGroups = await Promise.all(features.map(async feature => await feature.menuItems()));
  const trayMenu = Menu.buildFromTemplate([]);
  menuItemGroups.forEach((items, index) => {
    if (index !== 0) {
      trayMenu.append(new MenuItem({ type: 'separator' }));
    }
    items.forEach((item) => {
      trayMenu.append(new MenuItem(item));
    });
  });
  trayIcon.setContextMenu(trayMenu);
};


module.exports = { createTrayIcon, buildTrayMenu };