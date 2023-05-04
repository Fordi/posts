const storage = require("../storage.js");
const { fire } = require("./updateBus.js");
const { writeFile, rename, unlink } = require("fs/promises");
const getFilename = require("./getFilename.js");

const updateNote = async ({ id, ...props }, add) => {
  const syncNotes = (await storage.get('notes')) || {};
  const localNotes = (await storage.get('window')) || {};
  const sync = syncNotes[id];
  const local = localNotes[id] ?? {};
  if (!add && !syncNotes[id]) {
    throw new Error(`No note with id ${id}`);
  }  
  let writeSync = false;
  let writeLocal = false;
  const promises = [];
  const mdFile = getFilename({ id, title: props.title });
  const updateHasNote = 'note' in props;
  if ('title' in props && props.title !== sync.title) {
    const oldFn = sync.title !== undefined && getFilename({ id, title: sync.title });
    if (oldFn) {
      if (!updateHasNote) {
        promises.push(rename(oldFn, mdFile));
      } else {
        promises.push(unlink(oldFn));
      }
    }
    sync.title = props.title;
    syncNotes[id] = sync;
    writeSync = true;
  }

  if (updateHasNote) {
    promises.push(writeFile(mdFile, props.note, 'utf-8'));
  }

  ['accent', 'created', 'modified', 'width', 'height'].forEach((key) => {
    if (key in props && sync[key] !== props[key]) {
      sync[key] = props[key];
      syncNotes[id] = sync;
      writeSync = true;
    }
  });
  ['x', 'y', 'open', 'alwaysOnTop'].forEach((key) => {
    if (key in props && local[key] !== props[key]) {
      local[key] = props[key];
      localNotes[id] = local;
      writeLocal = true;
    }
  });
  writeLocal && promises.push(storage.set('window', localNotes));
  writeSync && promises.push(storage.set('notes', syncNotes));
  
  await Promise.all(promises);
  if (writeSync || updateHasNote) {
    fire(id);
  }
  return { id, note: props.note, ...local, ...sync };
};

module.exports = updateNote;