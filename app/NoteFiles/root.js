const { app } = require('electron');
const { join } = require('path');

module.exports = join(app.getPath('userData'), 'notefiles');
