const { unlink } = require("fs/promises");
const storage = require("../storage.js");
const getFilename = require("./getFilename.js");
const { fire } = require("./updateBus.js");

module.exports = async function deleteNote(noteId) {
  const sync = await storage.get('notes');
  const local = await storage.get('window');
  const promises = [];
  if (sync[noteId]) {
    const { title } = sync[noteId];
    delete sync[noteId];
    promises.push(
      unlink(getFilename({ id: noteId, title })),
      storage.set('notes', sync),
    );
  }
  delete local[noteId];
  promises.push(storage.set('window', local));
  await Promise.all(promises);
  fire(noteId);
};
