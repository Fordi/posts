
const storage = require("../storage.js");
const { fire } = require("./updateBus.js");

module.exports = async function deleteNote(noteId) {
  const notes = await storage.get('notes');
  if (!notes.length) return;
  const note = notes.find(({ id }) => id === noteId);
  if (!note) return;
  await storage.set('notes', notes.filter(n => n !== note));
  fire(noteId);
};
