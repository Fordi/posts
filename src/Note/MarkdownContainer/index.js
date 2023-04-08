import { useCallback, useEffect, useRef, useState } from "react";

import MarkdownIt from 'markdown-it';
import taskify from "@fordi-org/taskify";
import MarkdownMultimdTable from 'markdown-it-multimd-table';

import { handleLink } from "../util";
import "./index.css";
import cls from "../../util/cls";

const md = new MarkdownIt({
  html: true,
  xhtmlOut: true,
  breaks: false,
  linkify: true,
  typographer: true,
})
  .use(taskify, { readOnly: false, itemClass: 'task', listClass: 'has-tasks' })
  .use(MarkdownMultimdTable, {
    multiline: true,
    rowspan: true,
    headerless: true,
    multibody: true,
    autolabel: true,
  });

export default function MarkdownContainer({ className, content, onCheckboxChange, postProcess = async () => {} }) {
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
    (async () => {
      if (!needsRender || !rendered.current) return;
      const d = document.createElement('div');
      d.innerHTML = content ? md.render(content) : '';
      await postProcess(d);
      rendered.current.innerHTML = d.innerHTML;
      setNeedsRender(false);
      setNeedsListeners(true);
    })();
  }, [content, needsRender, postProcess]);

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
