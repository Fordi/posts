const { app, nativeImage, Tray, Menu, MenuItem } = require("electron");
const { join } = require('path');
const API = require("../API");

const pkg = API.getPackage();

module.exports = class TrayApp {
  #features;
  #shuttingDown = false;
  #appIcon = null;
  #initialized = false;

  constructor(...features) {
    this.#features = [...features];
  }

  async add(...features) {
    this.#features.push(...features);
    if (this.#initialized) {
      await Promise.all(this.#features.map(async (feature) => await feature.init?.()));
      await this.buildTrayMenu();
    }
  }

  async buildTrayMenu() {
    if (!this.#appIcon) {
      this.#appIcon = new Tray(nativeImage.createFromPath(join(__dirname, './icon_20.png')));
      this.#appIcon.setToolTip(pkg.properName || pkg.name);
    }
    const menuItemGroups = (await Promise.all(this.#features.map(async feature => 
      await feature.menuItems?.()
    ))).filter(a => !!a);
    const trayMenu = Menu.buildFromTemplate([]);
    menuItemGroups.forEach((items, index) => {
      if (index !== 0) trayMenu.append(new MenuItem({ type: 'separator' }));
      items.forEach((item) => trayMenu.append(new MenuItem(item)));
    });
    this.#appIcon.setContextMenu(trayMenu);
  }

  async *#shutdown() {
    for (const feature of this.#features) {
      yield feature.shutdown?.();
    }
  }

  async init() {
    if (this.#initialized) return;
    await app.whenReady();

    // Initialize features
    for (const feature of this.#features) {
      await feature.init?.();
    }
    await this.buildTrayMenu();

    // Let us hold shutdown so that features can do any async cleanup tasks.
    app.on('before-quit', async (event) => {
      if (!this.#shuttingDown) {
        event.preventDefault();
        this.#shuttingDown = true;
        for await (const allow of this.#shutdown()) {
          if (false === allow) {
            this.#shuttingDown = false;
            break;
          }
        }
        if (this.#shuttingDown) app.quit();
      }
    });
    this.#initialized = true;
  }
}
