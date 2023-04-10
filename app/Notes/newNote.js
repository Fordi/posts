const { v4: uuidv4 } = require('uuid');
const posts = require('../posts.js');
const showNote = require('./showNote.js');
const updateNote = require('./updateNote.js');

const INIT_NOTE = {
  title: "",
  note: "",
  accent: "#128C7E",
  created: 0,
  modified: 0,
  width: 400,
  height: 400,
  // local
  x: 525,
  y: 525,
  alwaysOnTop: false,
  open: true,
};

module.exports = async function newNote() {
  const note = await updateNote({
    ...INIT_NOTE,
    id: uuidv4(),
    created: +new Date(),
    modified: +new Date(),
  }, true);
  const window = await showNote(note.id);
  await posts.buildTrayMenu();
  return { window, note };
};
