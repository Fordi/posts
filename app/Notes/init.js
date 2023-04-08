const newNote = require('./newNote');
const showNote = require('./showNote');
const storage = require('../storage');
const API = require('../API');
const showOpenNotes = require('./showOpenNotes');
const updateNote = require('./updateNote');
const deleteNote = require('./deleteNote');
const getNote = require('./getNote');
const { app, BrowserWindow } = require('electron');

module.exports = async function init() {
  API.add({
    getNote, updateNote, deleteNote,
    showOpenNotes, newNote, showNote,
  });

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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      API.newNote();
    }
  });
};
