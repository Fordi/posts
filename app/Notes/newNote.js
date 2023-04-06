const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const showNote = require('./showNote.js');
const updateNote = require('./updateNote.js');

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
  alwaysOnTop: false,
};

module.exports = async function newNote() {
  const note = await updateNote({
    id: uuidv4(),
    created: +new Date(),
    modified: +new Date(),
    ...INIT_NOTE,
  }, true);
  const window = await showNote(note.id);
  await app.rebuildTrayMenu();
  return { window, note };
};
