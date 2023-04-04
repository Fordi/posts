const storage = require("../storage.js");
const showNote = require("./showNote.js");
const newNote = require("./newNote.js");
const showOpenNotes = require("./showOpenNotes.js");
const { BrowserWindow } = require("electron");

module.exports = async function menuItems () {
  const notes = (await storage.get('notes')).filter(note => !!note.title);
  return [
    {
      label: "New note",
      click: async () => {
        await newNote();
      }
    },
    ...(notes.length ? [
      { type: 'separator' },
      ...notes.map(({ id, title }) => ({
        label: title,
        click: () => {
          const window = BrowserWindow.getAllWindows().find((window) => {
            const params = new URL(window.webContents.getURL()).searchParams;
            return params.get('mode') === 'note' && params.get('id') === id;
          });
          if (!window) {
            showNote(id);
          } else {
            window.focus();
          }
        }
      })),
      { type: 'separator' },
      {
        label: 'Bring notes to front',
        click: () => {
          showOpenNotes();
        }
      }
    ] : []),
    
  ];
};