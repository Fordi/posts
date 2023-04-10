const storage = require("../storage");
const notesRoot = require("./root");
const updateNote = require("./updateNote");
const { mkdir } = require('fs/promises');

module.exports = async function migrations() {
  await mkdir(notesRoot, { recursive: true });
  const notes = await storage.get('notes');
  if (Array.isArray(notes)) {
    await storage.remove('notes');
    await Promise.all(notes.map(note => updateNote(note, true)));
  }
};