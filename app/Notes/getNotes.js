const storage = require("../storage.js");

module.exports = async function getNotes() {
  return Object.keys(await storage.get('notes') || {});
};
