const { ipcMain, shell } = require("electron");
const pkg = require('../../package.json');
const { openExternal } = shell;

const wrapped = (fn) => async (event, ...args) => fn.apply(event.sender, args);

const API = {
  add(handlers) {
    Object.keys(handlers).forEach((name) => {
      const handler = handlers[name];
      API[name] = handler;
      ipcMain.handle(name, wrapped(handler));
    });
    return API;  
  }
};

const isPrivate = new Set(Object.keys(API));

const getArgs = (fn) => fn.toString()
  .replace(/^[\s\S]*?\(([^)]*)\)[\s\S]*$/, '$1')
  .split(',')
  .map(a => a.trim())
  .filter(a => !!a);

API.add({
  getApi() {
    return Object.keys(API).reduce((apiSpec, key) => {
      if (!isPrivate.has(key)) {
        apiSpec[key] = getArgs(API[key]);
      }
      return apiSpec;
    }, {});
  },
  getPackage() {
    return pkg;
  },
  openExternal,
  openDevTools() {
    this.closeDevTools();
    this.openDevTools({ mode: 'detach' });
  },
});

module.exports = API;