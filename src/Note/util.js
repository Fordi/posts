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

export const indentSelection = ({ value, selectionStart, selectionEnd }) => {
  if (selectionStart === selectionEnd) return {
    value: `${value.substring(0, selectionStart)}    ${value.substring(selectionStart)}`,
    selectionStart: selectionStart + 4,
    selectionEnd: selectionStart + 4,
  };

  const start = seekToNewLine(value, selectionStart, false);
  const end = seekToNewLine(value, selectionEnd, true);

  const replacement = value
    .substring(start, end)
    .split('\n')
    .map(line => `    ${line}`)
    .join('\n');

  return {
    value: `${value.substring(0, start)}${replacement}${value.substring(end)}`,
    selectionStart: start,
    selectionEnd: start + replacement.length + 1,
  };
};

export const outdentSelection = ({ value, selectionStart, selectionEnd }) => {
  let start = selectionStart;
  let end = selectionEnd;
  if (start === end) {
    start--;
    while (value[start] === ' ' && start > 0) start--;
    if (value[start] !== '\n') return;
    start++;
    end = start;
    while (value[end] === ' ' && end < value.length) end++;
    const ws = value.substring(start, end);
    const nws = ws.substring(0, ws.length - 4);
    const dt = nws.length - ws.length;
    return {
      value: `${value.substring(0, start)}${nws}${value.substring(end)}`,
      selectionStart: end + dt,
      selectionEnd: end + dt,
    };
  }
  if (value[start] === '\n') start--;
  while (value[start] !== '\n' && start > 0) start--;
  if (value[start] === '\n') start++;

  if (value[end] === '\n') end -= 1;
  if (value[end - 1] === '\n') end -= 2;
  while (value[end + 1] !== '\n' && end < value.length - 1) end += 1;

  const replacement = value
    .substring(start, end)
    .split('\n')
    .map(line => line.replace(/^\s{0,4}/, ''))
    .join('\n');
  return {
    value: `${value.substring(0, start)}${replacement}${value.substring(end)}`,
    selectionStart: start,
    selectionEnd: start + replacement.length + 1,
  };
};
