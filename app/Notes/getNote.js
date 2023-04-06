const storage = require("../storage.js");

module.exports = async function getNote(noteId) {
  const notes = await storage.get('notes');
  const index = notes.findIndex(note => note.id === noteId);
  if (index === -1) return null;
  return notes[index];
};
