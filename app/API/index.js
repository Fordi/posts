const { ipcMain, shell } = require("electron");
const pkg = require('../../package.json');
const { openExternal } = shell;

const getArgs = (fn) => fn.toString()
  .replace(/^[\s\S]*?\(([^)]*)\)[\s\S]*$/, '$1')
  .split(',')
  .map(a => a.trim())
  .filter(a => !!a);

function getApi() {
  const apiSpec = {};
  Object.keys(API).forEach((key) => apiSpec[key] = getArgs(API[key]));
  return apiSpec;
}

function getPackage() {
  return pkg;
}

const API = {
  getApi,
  getPackage,
  openExternal,
};

let initialized = false;

const wrapped = (fn) => async (event, ...args) => fn.apply(event.sender, args);

const init = () => {
  Object.keys(API).forEach((key) => {
    ipcMain.handle(key, wrapped(API[key]));
  });
  initialized = true;
};

const add = (name, handler) => {
  API[name] = privateAPI[name] = handler;
  if (initialized) {
    ipcMain.handle(name, wrapped(handler));
  }
  return add;
};

const privateAPI = {
  ...API,
  init,
  add,
};

module.exports = privateAPI;