const newNote = require('./newNote');
const showNote = require('./showNote');
const API = require('../API');
const showOpenNotes = require('./showOpenNotes');
const updateNote = require('./updateNote');
const deleteNote = require('./deleteNote');
const getNote = require('./getNote');
const { app, BrowserWindow } = require('electron');
const getNotes = require('./getNotes');
const getWindowProps = require('./getWindowProps');
const migrations = require('./migrations');

module.exports = async function init() {
  await migrations();
  API.add({
    getNote, updateNote, deleteNote,
    showOpenNotes, newNote, showNote,
  });

  const notes = await getNotes();
  
  if (!Object.keys(notes).length) {
    await newNote();
  } else {
    await Promise.all(notes.map(async id => {
      const { open } = (await getWindowProps(id)) ?? {};
      if (open) {
        await showNote(id);
      }
    }));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      API.newNote();
    }
  });
};
