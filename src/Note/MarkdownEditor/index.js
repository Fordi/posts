import { useCallback, useEffect, useRef } from "react"
import TurndownService from "turndown";
import cls from "../../util/cls";
import useShortcutHandler from "../../util/useShortcutHandler";
import { continueList, indentSelection, outdentSelection, seekToNewLine } from "../util";

const ALIGNS = {
  '': ['-', '-'],
  'left': [':', '-'],
  'right': ['-', ':'],
  'center': [':', ':'],
};

const td = new TurndownService()
  .addRule('checks', {
    filter: ['input'],
    replacement(_, node) {
      if (node.type === 'checkbox') {
        return node.checked ? '[x] ' : '[ ] ';
      }
      return '';
    }
  })
  .addRule('tables', {
    filter: ['table'],
    replacement(_, node) {
      const rows = [...node.querySelectorAll('tr')];
      const numCols = rows.reduce((c, row) => Math.max(c, row.querySelectorAll('td, th').length), 0);
      if (numCols === 1) {
        return rows.map(row => row.textContent.trim()).join('\n') + '\n';
      }
      const columnWidths = [];
      const columnAligns = [];
      rows.forEach((row) => {
        [...row.querySelectorAll('td, th')].forEach((col, index) => {
          const md = td.turndown(col.innerHTML);
          col.setAttribute('data-md', md);
          columnAligns[index] = columnAligns[index] || {};
          columnAligns[index][col.style.textAlign] = (columnAligns[index][col.style.textAlign] || 0) + 1;
          columnWidths[index] = Math.max(columnWidths[index] || 0, md.length);
        });
      }, []);
      columnAligns.forEach((a, index) => {
        columnAligns[index] = Object.keys(a).reduce(([value, max], subject) => (
          a[subject] > max ? [subject, a[subject]] : [value, max]
        ), ['', 0])[0];
      });
      const head = node.querySelectorAll('thead')[0];
      const body = node.querySelectorAll('tbody')[0];
      const lines = [];
      if (head) {
        lines.push(...[...head.querySelectorAll('tr')].map((row) => {
          return `| ${[...row.querySelectorAll('td, th')].map((cell, index) => {
            return cell.getAttribute('data-md').padEnd(columnWidths[index]);
          }).join(' | ')} |`
        }));
      }
      lines.push(`|${columnWidths.map((w, index) => ALIGNS[columnAligns[index]].join(''.padEnd(w, '-'))).join('|')}|`);
      lines.push(...[...body.querySelectorAll('tr')].map((row) => (
        `| ${[...row.querySelectorAll('td, th')].map((cell, index) => cell.getAttribute('data-md').padEnd(columnWidths[index])).join(' | ')} |`
      )));
      return `\n${lines.join('\n')}`;
    }
  })

const nativeSetValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
const applyInput = (el, update) => {
  if (!update) return;
  const { value, selectionStart, selectionEnd } = update;
  nativeSetValue.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true}));
  el.selectionStart = selectionStart;
  el.selectionEnd = selectionEnd;
  return false;
};

const continueLists = ({ target }) => applyInput(target, continueList(target));

const clearFourSpaces = ({ target }) => {
  if (target.selectionStart !== target.selectionEnd) return;
  const { value, selectionStart } = target;
  const toHere = value.substring(seekToNewLine(value, selectionStart), selectionStart);
  if (/^(\s{4})+$/.test(toHere)) {
    applyInput(target, {
      value: `${value.substring(0, selectionStart - 4)}${value.substring(selectionStart)}`,
      selectionStart: selectionStart - 4,
      selectionEnd: selectionStart - 4,
    });
    return false;
  }
};

const indent = ({ target }) => applyInput(target, indentSelection(target));
const outdent = ({ target }) => applyInput(target, outdentSelection(target));

export default function MarkdownEditor({
  autoFocus,
  className,
  onChange = () => {},
  value,
  placeholder,
  saveFile = async () => {},
  preProcessPastedHtml = async () => {},
}) {
  const editor = useRef(null);
  
  const handleEditorKeys = useShortcutHandler({
    "Shift+Tab": outdent,
    "Tab": indent,
    "Enter": continueLists,
    "Backspace": clearFourSpaces,
  });

  const handleRichPaste = useCallback((event) => {
    const { clipboardData, target, target: { value, selectionStart, selectionEnd} } = event;
    const types = [...clipboardData.types];
    if (types.indexOf('text/html') !== -1) {
      event.preventDefault();
      const d = document.createElement('div');
      d.innerHTML = clipboardData.getData('text/html'); 
      (async () => {
        await preProcessPastedHtml(d);
        const pastedMarkdown = td.turndown(d.innerHTML);
        const cursor = selectionStart + pastedMarkdown.length;
        applyInput(target, {
          value: [
            value.substring(0, selectionStart),
            pastedMarkdown,
            value.substring(selectionEnd)
          ].join(''),
          selectionStart: cursor,
          selectionEnd: cursor,
        });
      })();
      return false;
    }
    if (types.length === 1 && types[0] === 'Files') {
      const pastedImage = [...clipboardData.files].find(({ type }) => type.startsWith('image/'));
      const reader = new FileReader();
      reader.onload = async () => {
        applyInput(target, await saveFile(reader.result, target));
      };
      reader.readAsDataURL(pastedImage);
      return false;
    }
  }, [preProcessPastedHtml, saveFile]);
  
  useEffect(() => {
    if (autoFocus) editor.current.focus();
  }, [autoFocus]);

  return (
    <textarea
      ref={editor}
      className={cls("markdown-editor", className)}
      placeholder={placeholder}
      autoComplete="off"
      autoFocus={autoFocus}
      onChange={onChange}
      value={value}
      onKeyDown={handleEditorKeys}
      onPaste={handleRichPaste}
    ></textarea>
  )
}