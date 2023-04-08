const storage = require('../storage');

module.exports = async function getFiles() {
  return Object.keys(await storage.get('files') || {});
};
