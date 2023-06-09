const storage = require("../storage.js");
const showNote = require("./showNote.js");
const newNote = require("./newNote.js");
const showOpenNotes = require("./showOpenNotes.js");
const { BrowserWindow } = require("electron");

module.exports = async function menuItems () {
  const notesObj = (await storage.get('notes') || {});
  const notes = Object.keys(notesObj).map((id) => ({ id, ...notesObj[id] }));
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
        label: title || "Untitled note",
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