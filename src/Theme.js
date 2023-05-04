/**
 * @type AccentTheme {object}
 * @property titleBarBg {string} color of top border color
 * @property titleBarFg {string} color of text in the titlebar
 * @property titleBarOn {string} color of an "on" icon in the titlebar
 * @property titleBarOff {string} color of an "off" icon in the titlebar
 * @property contentBg {string} content background color
 * @property contentText {string} content text color
 * @property tableEvenRowBg {string} background of even rows
 * @property tableOddRowBg {string} background of odd rows
 * @property tableBorder {string} border of tables
 * @property keywordBg {string} background of keywords (`keyword`)
 * @property keywordBorder {string} border of keywords
 * @property codeBg {string} background of code blocks
 * @property codeBorder {string} border of code blocks
 * @property lists {string} color of bullets / list numbers
 */
/**
 * Will create a color theme centered around an accent color
 * @param accent {string} The center color
 * @returns AccentTheme
 */

import { hsv, hsvToAlpha, hsvToHex } from "./util/color";
const { min } = Math;

export default function Theme(accent = '#123456') {
  const col = hsv.fromHex(accent);
  const [h, s, v] = col;
  const light = v > 50;
  const contentBg = col.desaturate(0.75).lighten(0.9);
  const contentFg = col.desaturate(0.75).darken(0.9);
  const theme = {
    accent,
    titleFg: col.toHex(),
    titleBarBg: accent,
    titleBarFg: col.contrast(0.8),
    contentBg,
    contentFg,
    tableEvenRow: contentBg.desaturate(0.1),
    tableOddRow: contentBg.darken(0.1),
    tableBorder: contentFg.lighten(0.1),
    keywordBg: contentBg.desaturate(0.2),
    keywordBorder: contentFg.lighten(0.5),
    codeBg: contentBg.desaturate(0.3),
    codeFg: contentFg.darken(0.2),
    codeKeyword: hsvToHex([h, min(s, 32), light ? 63 : 75 ]),
    lists: hsvToHex([h, s, light ? (v + 3) / 2 : ((v + 90) / 2)]),
    activeLine: hsvToAlpha([h, min(s, 28), light ? 90 : 3], 0.33),
  };
  Object.keys(theme).forEach(key => {
    if (theme[key].toHex) {
      theme[key] = theme[key].toHex();
    }
  });
  Object.defineProperties(theme, {
    toString: {
      value: () => [
        ':root{',
        ...Object.keys(theme).map((key) => `  --${
          key.replace(/[A-Z]+/g, m => `-${m.toLowerCase()}`)
        }: ${theme[key]};`),
        '}',
      ].join('\n'),
    },
    apply: {
      value: () => {
        let themeSS = document.querySelector('style#theme');
        if (!themeSS) {
          themeSS = document.createElement('style');
          themeSS.id = 'theme';
          themeSS.type = 'text/css';
          document.head.appendChild(themeSS);
        }
        themeSS.textContent = theme.toString();
      }
    },
  })
  return theme;
}
