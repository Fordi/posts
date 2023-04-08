const contextMenu = require('electron-context-menu');
const Main = { 
  init() {
    contextMenu({ showCopyImage: true });
  },
  menuItems() {
    return [{ role: 'quit' }];
  }
};
module.exports = Main;
