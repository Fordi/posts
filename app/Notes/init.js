const newNote = require('./newNote.js');
const showNote = require('./showNote.js');
const storage = require('../storage.js');
const API = require('../API/index.js');
const showOpenNotes = require('./showOpenNotes.js');
const updateNote = require('./updateNote.js');
const deleteNote = require('./deleteNote.js');
const getNote = require('./getNote.js');

module.exports = async function init() {
  API.add('getNote', getNote);
  API.add('updateNote', updateNote);
  API.add('deleteNote', deleteNote);
  API.add('showOpenNotes', showOpenNotes);
  API.add('newNote', newNote);
  API.add('showNote', showNote);

  const notes = await storage.get('notes');

  if (!notes.length) {
    await newNote();
  } else {
    await Promise.all(notes.map(async note => {
      if (note.open) {
        await showNote(note.id);
      }
    }));
  }
};
