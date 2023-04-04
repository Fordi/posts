const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const storage = require('../storage.js');
const showNote = require('./showNote.js');

const INIT_NOTE = {
  title: "",
  note: "",
  accent: "#128C7E",
  mode: "text",
  grid: false,
  pin: null,
  protected: false,
  width: 525,
  height: 525,
  x: 400,
  y: 400,
  alarm: true,
  open: true,
};

module.exports = async function newNote() {
  if (!await storage.has('notes')) {
    await storage.set('notes', []);
  }
  const notes = (await storage.get('notes')) ?? [];
  const note = {
    id: uuidv4(),
    created: +new Date(),
    modified: +new Date(),
    ...INIT_NOTE,
  };
  notes.push(note);
  await storage.set('notes', notes);
  const window = await showNote(note.id);
  await app.rebuildTrayMenu();
  return { window, note };
};
