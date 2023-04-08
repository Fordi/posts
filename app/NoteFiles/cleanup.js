const getNote = require('../Notes/getNote');
const getNotes = require('../Notes/getNotes');
const deleteFile = require('./deleteFile');
const getFiles = require('./getFiles');

const IMAGE_REF = /!\[[^\]]+\]\(notefile:([A-Za-z0-9_-]{27})(?:\s"[^"]+")?\)/g;

module.exports = async function cleanup() {
  const refs = (await getFiles()).reduce((o, name) => {
    o[name] = 0;
    return o;
  }, {});

  await Promise.all((await getNotes()).map(async (id) => {
    const note = await getNote(id);
    for (const match of note.note.matchAll(IMAGE_REF)) {
      const [id] = match.slice(1);
      refs[id] += 1;
    }
  }));

  await Promise.all(Object.keys(refs).map(async (id) => {
    if (refs[id] === 0) {
      // No references to ${id}; deleting.
      await deleteFile(id);
    }
  }));
};
