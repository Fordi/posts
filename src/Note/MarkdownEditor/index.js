import { useCallback, useEffect, useRef } from "react"
import CodeMirror from '@uiw/react-codemirror';
import { createTheme } from '@uiw/codemirror-themes';
import TurndownService from "turndown";
import cls from "../../util/cls";
import useShortcutHandler from "../../util/useShortcutHandler";
import { continueList, indentSelection, outdentSelection, seekToNewLine } from "../util";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from '@codemirror/language-data';
import useTransform from "../../util/useTransform";
import { tags as t } from '@lezer/highlight';
import './index.css';

const markdownConfig = markdown({
  base: markdownLanguage,
  codeLanguages: languages,
});

const ALIGNS = {
  '': ['-', '-'],
  'left': [':', '-'],
  'right': ['-', ':'],
  'center': [':', ':'],
};

const editorConfig = {
  lineNumbers: false,
  foldGutter: false,
  lineWrapping: true,
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
  theme = {},
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
    if (types.indexOf('vscode-editor-data') !== -1 && types.indexOf('text/plain') !== -1) {
      const codeData = (() => {
        try {
          return JSON.parse(clipboardData.getData('vscode-editor-data'));
        } catch (e) {
          return null;
        }
      })();
      const text = clipboardData.getData('text/plain').split('\n');
      const minSpc = ''.padEnd(Math.min(...text.slice(1).map((line) => line.match(/^\s*/)[0].length)));
      text.forEach((line, index) => {
        if (line.startsWith(minSpc)) {
          text[index] = line.substring(minSpc.length);
        }
      });

      const pastedMarkdown = [
        `\`\`\`${codeData?.mode}`,
        ...text,
        `\`\`\``,
        '',
      ].join('\n');
      const cursor = selectionStart + pastedMarkdown.length;
      applyInput(target, {
        value: [
          value.substring(0, selectionStart),
          pastedMarkdown,
          value.substring(selectionEnd),
        ].join(''),
        selectionStart: cursor,
        selectionEnd: cursor,
      });
      event.preventDefault();
      return;
    }
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
    if (autoFocus) editor.current?.focus();
  }, [autoFocus]);
  const cmTheme = useTransform(() => {
    if (!theme) return undefined;
    return createTheme({
      theme: 'dark',
      settings: {
        background: theme.contentBg,
        foreground: theme.contentFg,
        caret: theme.contentFg,
        selection: theme.accent,
        selectionMatch: theme.accent,
        lineHighlight: theme.activeLine,
        fontFamily: `"Fira Code", "Consolas", monospace`,
      },
      styles: [
        // Headings
        { tag: t.heading, class: 'md-heading' },
        // MD symbols
        { tag: t.processingInstruction, class: 'md-symbol' },
        // Blockquotes
        { tag: t.quote, class: 'md-blockquote' },
        // `keywords`
        { tag: t.monospace, class: 'md-keyword' },
        // italics
        { tag: t.emphasis, class: 'md-italic' },
        // bold
        { tag: t.strong, class: 'md-bold' },
        // Escaped items
        { tag: t.escape, class: 'md-escaped' },
        // Links and images
        { tag: t.link, class: 'md-link' },
        // The URL in them
        { tag: t.url, class: 'md-url' },
        // HR
        { tag: t.contentSeparator, class: 'md-hr' },
        // checkboxes
        { tag: t.atom, class: 'md-check' },
        // HTML entities
        { tag: t.character, class: 'md-entity' },
        // HTML-style comments
        { tag: t.comment, class: 'md-comment' },

        // Code blocks
        // Keywords (class, return, etc)
        { tag: t.keyword, class: 'md-code-keyword' },
        // Strings
        { tag: t.string, class: 'md-code-string' },
        // {}, [], (), <>
        { tag: t.bracket, class: 'md-code-brace' },
        // All other punctuation
        { tag: t.punctuation, class: 'md-code-punct' },
        // Names of things
        { tag: t.name, class: 'md-code-name' },
        // Property names
        { tag: t.propertyName, class: 'md-code-prop' },
        // Numbers
        { tag: t.number, class: 'md-code-num' },
      ],
    });
  }, [theme]);
  return <CodeMirror
    className={cls("markdown-editor", className)}
    onChange={onChange}
    value={value}
    extensions={[markdownConfig]}
    basicSetup={editorConfig}
    theme={cmTheme}
  />;

}