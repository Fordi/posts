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

  const focusTitle = useCallback(() => {
    document.querySelector('.note__title').focus();
  }, []);

  const menuItems = useTransform(() => [
    { title: "Delete", comp: Trash, onClick: deleteNote, accel: ['Ctrl+Backspace'] },
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
                />

                <div className="status">
                  <a href="https://github.github.com/gfm/" onClick={handleLink}>Markdown</a> supported.  Ctrl+Enter to save.
                </div>
              </>
            )
            : (
              <div className="note__content">
                {note?.note
                  ? <MarkdownContainer content={note?.note} onCheckboxChange={onTaskToggle} />
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
