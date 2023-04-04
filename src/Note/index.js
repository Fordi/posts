import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import Layout from "../Layout";

import { useCallback, useEffect, useRef, useState } from "react";
import useEventListener from "../util/useEventListener";
import Menu from "./Menu";
import add from "../icons/add.svg";
import edit from "../icons/edit.svg";
import save from "../icons/save.svg";
import trash from "../icons/trash.svg";
import hide from "../icons/hide.svg";

import "./index.css";

const md = new MarkdownIt().use(taskLists, { enabled: true, label: true, labelAfter: true });

const ColorPicker = ({ onChange, value }) => (
  <input className="color-picker" type="color" onChange={onChange} value={value} />
);

export default function Note({ noteId }) {
  const tasks = useRef(null);
  const editor = useRef(null);
  const main = useRef(null);
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState(null);
  const [content, setContent] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const fetchNote = useCallback(async () => {
    const n = await window.API.getNote(noteId);
    if (!n) {
      window.close();
    }
    setNote(n);
  }, [noteId]);
  const storageChanged = useCallback((event) => event.key === `notes.${noteId}` && fetchNote(), [fetchNote, noteId]);
  
  useEventListener(window, 'storage', storageChanged);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    if (note) {
      setTitle(note?.title);
      setContent(note?.note);
      document.title = note?.title;
      setDirty(false);
    }
  }, [note]);

  const titleChange = useCallback(({ target: { value } }) => {
    setTitle(value);
    document.title = value;
    setDirty(true);
  }, []);

  const commitTitle = useCallback(async ({ target: { value } }) => {
    await window.API.updateNote({ ...note, title: value, note: content });
    await fetchNote();
  }, [content, fetchNote, note]);

  const contentChange = useCallback(({ target: { value } }) => {
    setContent(value);
    setDirty(true);
  }, []);

  const colorChange = useCallback(async ({ target: { value } }) => {
    await window.API.updateNote({ ...note, accent: value });
  }, [note]);

  useEffect(() => {
    let unlistens = [];
    if (!tasks.current) return;
    tasks.current.innerHTML = note ? md.render(note.note) : '';
    const items = [...(tasks.current?.querySelectorAll('.task-list-item-checkbox') ?? [])];
    const handler = async ({ target: { value, checked } }) => {
      const m = [...note.note.matchAll(/((?:^|\n)\s*[*-]\s+\[)([x\s])(\]\s+)/g)][value];
      const replacement = `${m[1]}${checked ? 'x' : ' '}${m[3]}`;
      const n = `${note.note.substring(0, m.index)}${replacement}${note.note.substring(m.index + m[0].length)}`;
      await window.API.updateNote({ ...note, note: n });
    };
    items.forEach((task, index) => {
      task.name = 'task';
      task.value = index;
      task.addEventListener('change', handler);
      unlistens.push(() => {
        task.removeEventListener('change', handler);
      });
    });
    return () => unlistens.forEach(unlisten => unlisten());
  }, [note, editing]);
  useEffect(() => {
    if (editing) {
      editor.current?.focus();
    } else {
      main.current?.focus();
    }
  }, [editing]);
  const saveNote = useCallback(async () => {
    if (dirty) {
      await window.API.updateNote({ ...note, title, note: content });
      await fetchNote();
    }
    setEditing(false);
  }, [content, dirty, fetchNote, note, title]);
  useEffect(() => {
    const items = [];
    if (note) {
      items.push({ title: "Delete", icon: trash, onClick: async () => {
        await window.API.deleteNote(note.id);
        window.close();
      }});
      if (!editing) {
        items.push({ title: "Edit", icon: edit, onClick: () => setEditing(true)});
      }
      if (editing) {
        items.push({ title: "Save", icon: save, onClick: async () => {
          saveNote();
        }});
      }
      items.push({ title: "Add", icon: add, onClick: () => window.API.newNote() });
      items.push({ title: "Color", comp: ColorPicker, props: { value: note?.accent, onChange: colorChange } });
      items.push({ title: "Hide", icon: hide, onClick: () => window.close() });
    }
    setMenuItems(items);    
  }, [colorChange, content, dirty, editing, fetchNote, note, saveNote, title]);
  const onNoteClick = useCallback(({ target }) => {
    if (target.matches('.task-list-item-checkbox, .task-list-item-label')) {
      return;
    }
    setEditing(true);
  }, []);
  const handleEditorKeys = useCallback((event) => {
    const { shiftKey, ctrlKey, key, target } = event;
    if (key === 'Escape') {
      setEditing(false);
      setContent(note?.note);
    }
    if (ctrlKey && (key === 'Enter' || key === 's')) {
      saveNote();
    }
    if (key === 'Tab') {
      event.preventDefault();
      const { selectionStart, selectionEnd, value } = target;
      let start = selectionStart;
      let end = selectionEnd;
      if (start === end) {
        if (shiftKey) return;
        setContent(`${value.substring(0, start)}    ${value.substring(start)}`);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 4;
        });
        setDirty(true);
        return;
      }
      if (value[start] === '\n') start--;
      while (value[start] !== '\n' && start > 0) start--;
      if (value[start] === '\n') start++;
      while (value[end + 1] !== '\n' && end < value.length - 1) end++;
      const replacement = value.substring(start, end).split('\n').map(line => {
        if (!shiftKey) return `    ${line}`;
        return line.replace(/^\s{4}/, '');
      }).join('\n');
      setContent(`${value.substring(0, start)}${replacement}${value.substring(end)}`);
      requestAnimationFrame(() => {
        target.selectionStart = start;
        target.selectionEnd = start + replacement.length;
      });
      setDirty(true);
      return;
    }
  }, [note?.note, saveNote]);
  const handlePageKeys = useCallback((event) => {
    if (editing) return;
    const { key } = event;
    if (key === 'e') {
      event.preventDefault();
      setEditing(true);
    }
  }, [editing]);
  return (
    <Layout loading={!note} style={{ color: note?.accent }} className="note">
      {!!note && (
        <div className="note__main" onKeyDown={handlePageKeys} tabIndex="0" ref={main}>
          <div className="note__heading">
            <textarea
              className="note__title"
              placeholder="Title"
              autoComplete="off"
              autoFocus={true}
              onChange={titleChange}
              value={title ?? ''}
              onBlur={commitTitle}
            ></textarea>
            <Menu note={note} items={menuItems}/>
          </div>
          {editing
            ? (
              <textarea
                ref={editor}
                className="note__editor"
                placeholder="Markdown enabled."
                autoComplete="off"
                autoFocus={false}
                onChange={contentChange}
                value={content ?? ''}
                onKeyDown={handleEditorKeys}
              ></textarea>
            )
            : (
              <div className="note__content" onClick={onNoteClick}>
                {note.note
                  ? (
                    <div ref={tasks}></div>
                  )
                  : (
                    <span className="note__placeholder">
                      To edit, you can click here, press 'Enter', or use the 'Edit' icon to enter edit mode.
                    </span>
                  )
                }
              </div>
            )
          }
        </div>
      )}
    </Layout>
  );
};
