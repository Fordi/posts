const { unlink } = require('fs/promises');
const { join } = require('path');
const root = require('./root');
const storage = require('../storage');

module.exports = async function deleteFile(id) {
  const src = join(root, id);
  try {
    const files = await storage.get('files');
    const metadata = files[id];
    delete files[id];
    await Promise.all([
      unlink(`${src}.${metadata.ext}`),
      await storage.set('files', files),
    ]);
  } catch (e) {}
};
