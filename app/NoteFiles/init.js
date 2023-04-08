const { protocol } = require("electron");
const { mkdir } = require('fs/promises');
const API = require('../API');
const cleanup = require("./cleanup");
const getFile = require("./getFile");
const getFileAsDataUrl = require("./getFileAsDataUrl");
const hasFile = require("./hasFile");
const newFile = require("./newFile");
const root = require("./root");

module.exports = async function init() {
  await mkdir(root, { recursive: true });
  await cleanup();

  protocol.interceptBufferProtocol('notefile', async (request, resolve) => {
    const { pathname: id } = new URL(request.url);
    try {
      const { metadata: { mimeType }, data } = await getFile(id);
      resolve({ mimeType, data });
    } catch (e) {
      // No file with ${id}: ${e.message}
      resolve({ statusCode: 404, data: "Not found" });
      return;
    }
  });

  API.add({ getFile, newFile, getFileAsDataUrl, hasFile });
};