const storage = require("../storage.js");

module.exports = async function getNotes() {
  return (await storage.get('notes')).map(({ id }) => id);
};
