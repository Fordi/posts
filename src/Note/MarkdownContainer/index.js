import { useCallback, useEffect, useRef, useState } from "react";

import MarkdownIt from 'markdown-it';

import { handleLink } from "../util";
import "./index.css";
import taskify from "./taskify";
import cls from "../../util/cls";

const md = new MarkdownIt().use(taskify, { readOnly: false, itemClass: 'task', listClass: 'has-tasks' });

export default function MarkdownContainer({ className, content, onCheckboxChange }) {
  const rendered = useRef(null);
  const [needsRender, setNeedsRender] = useState(false);
  const [needsListeners, setNeedsListeners] = useState(false);

  const updateRef = useCallback((element) => {
    if (rendered.current !== element) {
      rendered.current = element;
      setNeedsRender(true);
      setNeedsListeners(true);
    }
  }, []);

  const onChange = useCallback((event) => {
    const pos = parseInt(event.target.getAttribute('data-pos'));
    const copy = [...content];
    copy[pos] = event.target.checked ? 'x' : ' ';
    event.detail = {
      pos,
      updatedContent: copy.join(''),
    };
    onCheckboxChange?.(event);
  }, [content, onCheckboxChange]);

  useEffect(() => {
    setNeedsRender(nr => {
      return true;
    });
  }, [content]);

  useEffect(() => {
    if (!needsRender || !rendered.current) return;
    rendered.current.innerHTML = content ? md.render(content) : '';
    setNeedsRender(false);
    setNeedsListeners(true);
  }, [content, needsRender]);

  useEffect(() => {
    setNeedsListeners(true);
  }, [onCheckboxChange]);

  useEffect(() => {
    if (!needsListeners || needsRender) return;
    const items = [...(rendered.current?.querySelectorAll('input[type="checkbox"]') ?? [])];
    items.forEach((task, index) => {
      task.addEventListener('change', onChange);
      task.closest('label').title = 'Click to toggle';
    });
    const links = [...(rendered.current?.querySelectorAll('a[href]') ?? [])];
    links.forEach((link) => {
      link.addEventListener('click', handleLink);
      link.title = link.href;
    });
  }, [needsListeners, needsRender, onChange]);

  return (
    <div
      className={cls('markdown--render', className)}
      ref={updateRef}
      title="Enter to edit"
    ></div>
  );
};
