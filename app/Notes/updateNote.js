const storage = require("../storage.js");
const { fire } = require("./updateBus.js");

const updateNote = async ({ id: noteId, ...props }, add) => {
  let notes = await storage.get('notes');
  if (!notes.length) notes = [];
  let index = notes.findIndex(note => note.id === noteId);
  let changed = false;
  if (index === -1) {
    if (!add) {
      return null;
    }
    index = notes.length;
    notes.push({ id: noteId, ...props });
    changed = true;
  }
  Object.keys(props).forEach((key) => {
    if (notes[index][key] !== props[key]) {
      notes[index][key] = props[key];
      changed = true;
    }
  });
  if (changed) {
    await storage.set('notes', notes);
    fire(noteId);
  }
  return notes[index];
};

module.exports = updateNote;