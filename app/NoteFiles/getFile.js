const { join } = require('path');
const { readFile } = require('fs/promises');
const root = require('./root');
const storage = require('../storage');

module.exports = async function getFile(id) {
  const metadata = ((await storage.get('files')) || {})[id];
  if (!metadata) throw new Error(`file ${id} does not exist`);
  const data = (await readFile(join(root, `${id}.${metadata.ext}`)));
  return { metadata, data };
};
