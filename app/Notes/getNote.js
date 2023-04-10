const storage = require("../storage.js");
const getFilename = require("./getFilename.js");
const { readFile } = require('fs/promises');
const getWindowProps = require("./getWindowProps.js");

module.exports = async function getNote(id) {
  const notes = await storage.get('notes');
  const sync = notes[id];
  if (!sync) {
    throw new Error(`No note by id ${id}`);
  }
  const local = await getWindowProps(id);
  const { title } = sync;
  let note = '';
  try {
    note = await readFile(getFilename({ id, title }), 'utf-8');
  } catch (e) {
    console.warn(e);
  }
  const fullNote = { id, note, ...sync, ...local };
  return fullNote;
};

