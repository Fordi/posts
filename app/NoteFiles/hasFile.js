const { readFile, stat } = require('fs/promises');
const { join } = require('path');
const root = require('./root');
const storage = require('../storage');

module.exports = async function hasFile(id) {
  return !!(((await storage.get('files')) || {})[id]);
};
