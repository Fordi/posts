const map = {
  '<': '﹤',
  '>': '﹥',
  ':': '꞉',
  '/': '⧸',
  '\\': '⧹',
  '|': '❘',
  '?': '︖',
  '*': '✶',
};

const slug = (name) => [...name].map(ch => map[ch] || ch).join('');

module.exports = slug;
