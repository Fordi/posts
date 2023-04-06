import { useCallback, useEffect, useState } from "react";
import useEventListener from "../util/useEventListener";

export const useNote = (noteId) => {
  const [note, setNote] = useState(null);

  const reloadNote = useCallback(async () => {
    const n = await window.API.getNote(noteId);
    if (!n) {
      window.close();
    }
    setNote(n);
  }, [noteId]);

  const updateNote = useCallback(async ({ id, ...props } = {}) => {
    await window.API.updateNote({ ...note, ...props });
    await reloadNote();
  }, [note, reloadNote]);

  const deleteNote = useCallback(async () => {
    if (!noteId) return;
    await window.API.deleteNote(noteId);
    window.close();
  }, [noteId]);

  useEffect(() => void reloadNote(), [reloadNote]);
  useEventListener(window, 'storage', useCallback((event) => event.key === `notes.${noteId}` && reloadNote(), [reloadNote, noteId]));
  const onTaskToggle = useCallback(async ({ detail: { updatedContent } }) => updateNote({ note: updatedContent }), [updateNote]);
  useCallback((event) => event.key === `notes.${noteId}` && reloadNote(), [reloadNote, noteId]);

  return { note, reloadNote, updateNote, deleteNote, onTaskToggle };
};
