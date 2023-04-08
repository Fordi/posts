const { extension } = require("mime-types");
const { parseDataUrl, digestSha1 } = require("./util");
const { join } = require('path');
const root = require("./root");
const { stat, writeFile } = require("fs/promises");
const storage = require('../storage');

module.exports = async function newFile(dataUrl) {
  const { data, metadata } = parseDataUrl(dataUrl);
  metadata.ext = extension(metadata.mimeType);
  const id = digestSha1(data);
  const files = (await storage.get('files')) || {};
  files[id] = metadata;
  const dest = join(root, id);
  const fn = `${dest}.${metadata.ext}`;
  await Promise.all([
    writeFile(fn, data),
    storage.set('files', files),
  ]);
  return id;
};
