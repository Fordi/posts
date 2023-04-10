const slug = require("./slug");
const { join } = require('path');
const notesRoot = require('./root');


module.exports = function getFilename({ id, title }) {
  return join(notesRoot, `${slug(title || 'untitled')}-${id.substring(0, 6)}.md`);
};
