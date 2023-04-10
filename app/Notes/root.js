const { app } = require('electron');
const { join } = require('path');

const notesRoot = join(app.getPath('userData'), 'notes');

module.exports = notesRoot;