const { app } = require('electron');
const posts = require('./posts');
const Notes = require('./Notes');
const NoteFiles = require('./NoteFiles');
const Main = require('./Main');

posts.add(Notes, NoteFiles, Main);
posts.init();

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  app.dock?.hide();
});
