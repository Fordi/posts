const getFile = require('./getFile');
const { charset } = require('mime-types');

module.exports = async function getFileAsDataUrl(id) {
  const { metadata: { mimeType }, data } = await getFile(id);
  const c = charset(mimeType);
  const content = Buffer.from(data).toString(c || 'base64');
  return `data:${mimeType}${c ? '' : ';base64'},${content}`;
};
