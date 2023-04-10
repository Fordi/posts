export const handleLink = async (event) => {
  event.preventDefault();
  await window.API.openExternal(event.target.href, { activate: true });
};

export const seekToNewLine = (text, position, forward) => {
  let p = position;
  if (forward) {
    if (text[p] === '\n') p -= 1;
    if (text[p - 1] === '\n') p -= 2;
    while (text[p + 1] !== '\n' && p < text.length - 1) p += 1;
    return p + 1;
  }
  if (text[p] === '\n') p--;
  while (text[p] !== '\n' && p > 0) p--;
  if (text[p] === '\n') p++;  

  return p;
};

const insert = ({ value, selectionStart, selectionEnd }, text, select = false) => ({
  value: `${value.substring(0, selectionStart)}${text}${value.substring(selectionEnd)}`,
  selectionStart: select ? selectionStart : selectionStart + text.length,
  selectionEnd: selectionStart + text.length,
});

const LIST_ITEM = /^((?:\s{4})*)(?:([*-]\s|\d+.\s)(\[[x_-\s]\]\s)?)?(.*)$/;

export const indentSelection = ({ value, selectionStart, selectionEnd }) => {
  const lineStart = seekToNewLine(value, selectionStart, false);
  const lineEnd = seekToNewLine(value, selectionEnd, true);

  if (selectionStart === selectionEnd) {
    const lineToCursor = value.substring(lineStart, selectionStart);
    const cursorToEol = value.substring(selectionStart, lineEnd);
    if (cursorToEol === '' && LIST_ITEM.test(lineToCursor)) {
      return {
        value: `${value.substring(0, lineStart)}    ${value.substring(lineStart)}`,
        selectionStart: selectionStart + 4,
        selectionEnd: selectionStart + 4,  
      }
    }
    return {
      value: `${value.substring(0, selectionStart)}    ${value.substring(selectionStart)}`,
      selectionStart: selectionStart + 4,
      selectionEnd: selectionStart + 4,
    };
  };


  const replacement = value
    .substring(lineStart, lineEnd)
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n');

  return {
    value: `${value.substring(0, lineStart)}${replacement}${value.substring(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + replacement.length + 1,
  };
};

export const outdentSelection = ({ value, selectionStart, selectionEnd }) => {
  const lineStart = seekToNewLine(value, selectionStart, false);
  const lineEnd = seekToNewLine(value, selectionEnd, true);
  if (selectionStart === selectionEnd) {
    return {
      value: `${value.substring(0, lineStart)}${value.substring(lineStart).replace(/^\s{4}/, '')}`,
      selectionStart: selectionStart - 4,
      selectionEnd: selectionStart - 4,  
    }
  }

  const replacement = value
    .substring(lineStart, lineEnd)
    .split('\n')
    .map(line => line.replace(/^\s{0,4}/, ''))
    .join('\n');
  return {
    value: `${value.substring(0, lineStart)}${replacement}${value.substring(lineEnd)}`,
    selectionStart: lineStart,
    selectionEnd: lineStart + replacement.length + 1,
  };
};

export const continueList = (target) => {
  const { value, selectionStart, selectionEnd } = target;
  if (selectionStart !== selectionEnd) return;
  const lineStart = seekToNewLine(value, selectionStart);
  const lineEnd = seekToNewLine(value, selectionStart, true);
  const line = value.substring(lineStart, lineEnd);
  const lineToSelection = value.substring(lineStart, selectionStart);
  let [matched, indent, list, check, content] = lineToSelection.match(LIST_ITEM);
  if (!content && list && lineToSelection === line) {
    return {
      value: `${value.substring(0, lineStart)}\n${value.substring(lineEnd + 1)}`,
      selectionStart: lineStart,
      selectionEnd: lineStart,
    };
  }
  if (line.replace(/^\n|\n$/g, '') === '') return;
  if (matched) {
    const start = [indent];
    start.push(list && !isNaN(parseInt(list)) ? `${parseInt(list) + 1}. ` : list);
    if (check) start.push('[ ] ');
    return insert(target, `\n${start.join('')}`);
  }
};