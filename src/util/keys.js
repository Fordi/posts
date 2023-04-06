const { platform } = window.navigator.userAgentData.platform;
const isApple = platform === 'macOS' || platform === 'iOS';
const isWin = platform === 'Windows';

export const keyNames = {
  ctrlKey: 'Ctrl',
  altKey: 'Alt',
  shiftKey: 'Shift',
  metaKey: isWin ? 'Win' : isApple ? 'Cmd' : 'Meta',
};
export const superKey = isApple ? 'metaKey' : 'ctrlKey';

const isMod = (k) => ['ctrl', 'alt', 'shift' ,'win', 'cmd', 'meta'].indexOf(k) !== -1;
  
const keyComparator = (a, b) => {
  const ma = isMod(a);
  const mb = isMod(b);
  if (ma && !mb) return -1;
  if (mb && !ma) return 1;
  return a > b ? 1 : a < b ? -1 : 0;
};

export const normalizeShortcut = (accel) => accel
  .toLowerCase()
  .split('+')
  .map(p => p.trim())
  .map((p) => {
    if (p === 'super') {
      return keyNames[superKey].toLowerCase();
    }
    return p;
  })
  .sort(keyComparator)
  .map(p => `${p.substring(0, 1).toUpperCase()}${p.substring(1)}`)
  .join('+');

export const keyEventName = (event) => normalizeShortcut([
  ...Object.keys(keyNames)
    .map((ident) => event[ident] ? keyNames[ident] : '')
    .filter(a => !!a),
  event.key
].join('+'));