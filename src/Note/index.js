import Layout from "../Layout/index.js";

import { useCallback, useEffect, useRef, useState } from "react";

import EditSave from "../icons/EditSave/index.js";
import Trash from "../icons/Trash.js";
import Add from "../icons/Add.js";
import Pin from "../icons/Pin/index.js";
import Hide from "../icons/Hide.js";

import MarkdownContainer from "./MarkdownContainer/index.js";
import ColorPicker from "./ColorPicker/index.js";
import MarkdownEditor from "./MarkdownEditor/index.js";

import { useNote } from "./hooks.js";
import { handleLink } from "./util.js";
import "./index.css";
import useTransform from "../util/useTransform.js";
import useAccelerators from "../util/useAccelerators.js";

const closeWindow = () => window.close();

const BROKEN_IMAGE = (() => {
  const d = document.createElement('broken-image');
  d.title = 'Broken image';
  d.innerHTML = `<svg fill="currentColor" viewBox="0 0 64 64" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 52V12c0-1 1-2 2-2h36.7L32 20l6 7-7 9 7 8-9 10H4c-1 0-2-1-2-2Zm16-16c2 0 11 10 11 10l3-4-6-6 7-8-7-8 5-6H6v33s10-11 12-11Zm24 7-5-6s3-6 5-6 16 17 16 17V14H43l3-4h14c1 0 2 1 2 2v40c0 1-1 2-2 2H34Z"/>
  </svg><span></span>`;

  return (alt) => {
    const p = d.cloneNode(true);
    const t = p.querySelector('span');
    if (alt) {
      t.textContent = alt;
    } else {
      p.removeChild(t);
    }
    return p;
  };
})();


const digestSha1 = async (data) => {
  const binHash = new Uint8Array(await window.crypto.subtle.digest('SHA-1', data));
  const hash = btoa(String.fromCharCode(...binHash)) 
    .replace(/\//g, '_')
    .replace(/\+/g, '-')
    .replace(/=+$/, '');
  return hash;
};

const parseDataUrl = (dataUrl) => {
  const { pathname } = new URL(dataUrl);
  const comma = pathname.indexOf(',');
  const content = pathname.substring(comma === -1 ? 5 : comma + 1);
  const mimeType = comma === -1 ? 'text/plain;charset=US-ASCII' : pathname.substring(0, comma);
  let data;
  let metadata;
  if (mimeType.endsWith(';base64')) {
    data = new Uint8Array([...atob(content)].map(n => n.charCodeAt(0)));
    metadata = { mimeType: mimeType.substring(0, mimeType.length - 7) };
  } else {
    data = new TextEncoder().encode(decodeURIComponent(content));
    metadata = { mimeType };
  }
  return { data, metadata };
};

const preProcessPastedHtml = async (container) => {
  [...container.querySelectorAll('style')].forEach(tag => tag.parentNode.removeChild(tag));
  await Promise.all([...container.querySelectorAll('img')].map(async (img) => {
    if (!img.src.startsWith('data:')) return;
    const hash = await digestSha1(parseDataUrl(img.src)?.data);
    if (await window.API.hasFile(hash)) {
      img.src = `notefile:${hash}`;
    }
  }));
};

const saveFile = async (dataUri, { value, selectionStart, selectionEnd }) => {
  const hash = await digestSha1(parseDataUrl(dataUri)?.data);
  const url = `notefile:${hash}`;
  
  if (!await window.API.hasFile(hash)) {
    const cmp = await window.API.newFile(dataUri);
    if (cmp !== hash) {
      throw new Error('Something went wrong');
    }
  }
  const image = `![Image](${url})`;
  const c = [
    value.substring(0, selectionStart),
    image,
    value.substring(selectionEnd),
  ].join('');
  const p = selectionStart + image.length;
  return { value: c, selectionStart: p, selectionEnd: p };
};

const postProcessRender = async (container) => Promise.all(
  [...container.querySelectorAll('img')].map(async img => {
    const u = new URL(img.src);
    if (u.protocol !== 'notefile:') return;
    try {
      img.src = await window.API.getFileAsDataUrl(img.src.substring(9));
    } catch (e) {
      const rep = BROKEN_IMAGE(img.alt);
      img.parentNode.replaceChild(rep, img);
    }
  })
);

const focusTitle = () => {
  document.querySelector('.note__title').focus();
};

export default function Note({ noteId }) {
  const { note, updateNote, onTaskToggle, deleteNote } = useNote(noteId);
  const main = useRef(null);

  const [title, setTitle] = useState(null);
  const [content, setContent] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);

  const titleChange = useCallback(({ target: { value } }) => {
    setTitle(value);
    document.title = value;
    setDirty(true);
  }, []);

  const commitTitle = useCallback(async ({ target: { value } }) => {
    updateNote({ title: value, note: content })
  }, [updateNote, content]);

  const colorChange = useCallback(async ({ target: { value } }) => {
    updateNote({ accent: value });
  }, [updateNote]);

  const toggleAlways = useCallback(async () => {
    await updateNote({ alwaysOnTop: !note?.alwaysOnTop });
  }, [note?.alwaysOnTop, updateNote]);

  const contentChange = useCallback(({ target: { value } }) => {
    setContent(value);
    setDirty(true);
  }, []);

  const editNote = useCallback(() => {
    setEditing(true);
    return false;
  }, []);

  const saveNote = useCallback(async () => {
    if (dirty) {
      await updateNote({ title, note: content });
    }
    setEditing(false);
  }, [dirty, updateNote, title, content]);

  const revertContent = useCallback(() => {
    setEditing(false);
    setContent(note?.note);
  }, [note?.note]);  
  const menuItems = useTransform(() => [
    { title: "Delete", comp: Trash, onClick: deleteNote, accel: ['Super+Backspace'] },
    {
      key: 'edit-save',
      title: editing ? "Save" : "Edit",
      accel: editing ? ['Super+Enter', 'Super+S'] : ['Enter'],
      onClick: editing ? saveNote : editNote,
      comp: EditSave,
      props: { editing }
    },
    { title: "Add", comp: Add, onClick: window.API.newNote, accel: ['Super+=', 'Super+Add'] },
    { title: "Color", comp: ColorPicker, props: { value: note?.accent ?? '#000000', onChange: colorChange } },
    { title: "Pin", comp: Pin, onClick: toggleAlways, props: { pinned: note?.alwaysOnTop }, accel: ['Super+P'] },
    { title: "Hide", comp: Hide, onClick: closeWindow, accel: ['Super+W'] }
  ], [colorChange, deleteNote, editNote, editing, note?.accent, note?.alwaysOnTop, note?.id, saveNote, toggleAlways]);
  
  useEffect(() => {
    if (note) {
      setTitle(note?.title);
      setContent(note?.note);
      document.title = note?.title;
      setDirty(false);
    }
  }, [note]);

  useAccelerators(() => ({
    'Super+L': focusTitle,
    Escape: editing && revertContent,
    'F12': window.API.openDevTools,
  }), [focusTitle, editing, revertContent]);

  return (
    <Layout loading={!note} style={{ color: note?.accent }} className="note" menu={menuItems}>
      {!!note && (
        <div className="note__main" tabIndex="0" ref={main}>
          <div className="note__heading">
            <textarea
              className="note__title"
              placeholder="Title"
              autoComplete="off"
              autoFocus={true}
              onChange={titleChange}
              value={title ?? ''}
              onBlur={commitTitle}
              title="Title.  Ctrl+L to focus"
            ></textarea>
          </div>
          {editing
            ? (
              <>
                <MarkdownEditor
                  className="note__editor"
                  placeholder="Markdown-enabled editor. Ctrl+Enter to save."
                  autoFocus={true}
                  onChange={contentChange}
                  value={content ?? ''}
                  saveFile={saveFile}
                  preProcessPastedHtml={preProcessPastedHtml}
                />

                <div className="status">
                  <a href="https://github.github.com/gfm/" onClick={handleLink}>Markdown</a> supported.  Ctrl+Enter to save.
                </div>
              </>
            )
            : (
              <div className="note__content">
                {note?.note
                  ? <MarkdownContainer
                      content={note?.note}
                      onCheckboxChange={onTaskToggle}
                      postProcess={postProcessRender}
                    />
                  : <div className="note__placeholder">
                      Press Enter to edit this note.
                    </div>
                }
              </div>
            )
          }
        </div>
      )}
    </Layout>
  );
};
