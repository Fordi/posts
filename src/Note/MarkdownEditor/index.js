import { useCallback, useEffect, useRef } from "react"
import TurndownService from "turndown";
import cls from "../../util/cls";
import useShortcutHandler from "../../util/useShortcutHandler";
import { indentSelection, outdentSelection, seekToNewLine } from "../util";

const td = new TurndownService();

td.addRule('checks', {
  filter: ['input'],
  replacement(_, node) {
    if (node.type === 'checkbox') {
      return node.checked ? '[x] ' : '[ ] ';
    }
    return '';
  }
});

const nativeSetValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
const applyInput = (el, { value, selectionStart, selectionEnd }) => {
  nativeSetValue.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true}));
  el.selectionStart = selectionStart;
  el.selectionEnd = selectionEnd;
  return false;
};
const insert = ({ value, selectionStart, selectionEnd }, text, select = false) => ({
  value: `${value.substring(0, selectionStart)}${text}${value.substring(selectionEnd)}`,
  selectionStart: select ? selectionStart : selectionStart + text.length,
  selectionEnd: selectionStart + text.length,
});

const continueLists = ({ target }) => {
  const { value, selectionStart } = target;
  const line = value.substring(seekToNewLine(value, selectionStart), seekToNewLine(value, selectionStart, true));
  if (line.replace(/^\n|\n$/g, '') === '') return;
  let [matched, indent, list, check] = line.match(/^((?:\s{4})*)(?:([*-]\s|\d+.\s)(\[[x_-\s]\]\s)?)?/);
  if (matched) {
    const start = [indent];
    start.push(list && !isNaN(parseInt(list)) ? `${parseInt(list) + 1}. ` : list);
    if (check) start.push('[ ] ');
    applyInput(target, insert(target, `\n${start.join('')}`));
    return false;
  }
};

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