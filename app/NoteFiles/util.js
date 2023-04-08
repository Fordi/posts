const { createHash } = require('crypto');

const digestSha1 = data => createHash('sha1').update(data).digest('base64')
  .replace(/\//g, '_')
  .replace(/\+/g, '-')
  .replace(/=+$/, '');


const parseDataUrl = (dataUrl) => {
  const { pathname } = new URL(dataUrl);
  const comma = pathname.indexOf(',');
  const mimeType = comma === -1 ? 'text/plain;charset=US-ASCII' : pathname.substring(0, comma);
  const content = pathname.substring(comma === -1 ? 5 : comma + 1);
  let data;
  let metadata;
  if (mimeType.endsWith(';base64')) {
    data = Buffer.from(content, 'base64');
    metadata = { mimeType: mimeType.substring(0, mimeType.length - 7) };
  } else {
    const charset = (mimeType.match(/;\s*charset\s*=\s*([^;\s]+)/) || [])[1] || 'utf-8';
    data = Buffer.from(content, charset);
    metadata = { mimeType };
  }
  return { data, metadata };
};

module.exports = {
  digestSha1,
  parseDataUrl,
};