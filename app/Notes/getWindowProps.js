const storage = require("../storage");

module.exports = async function getWindowProps(id) {
  return (await storage.get('window'))?.[id];
};
