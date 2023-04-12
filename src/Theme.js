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
import rgb from 'color-space/rgb.js';
import hsl from 'color-space/hsl.js';

const hexToRGB = hex => {
  if (hex.startsWith('#')) return hexToRGB(hex.substring(1));
  if (hex.length === 3) return [...hex].map(c => parseInt(c, 16) * 17);
  return [hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6)].map(c => parseInt(c, 16));
};
const rgbToHex = (rgb) => 
  `#${rgb.map(c => (c | 0).toString(16).padStart(2, '0').toUpperCase()).join('')}`;

const hslToHex = (hslc) => rgbToHex(hsl.rgb(hslc));

const { min } = Math;

export default function Theme(accent) {
  const [h, s, l] = rgb.hsl(hexToRGB(accent));
  // at s === 0, lt = 50
  // at s === 100, lt = 25
  // lt(s) = as + b
  // lt(0) = 50
  // lt(100) = 25
  // a*0 + b = 50
  // b = 50
  // a*100 + 50 = 25
  // a*100 = -25
  // a = -25 / 100
  // a = -1/4
  // lt(s) = -s/4 + 50
  const lt = 50 - s / 4;
  const light = l > lt;
  console.log({ lt, light });
  const theme = {
    accent,
    titleFg: hslToHex([h, s, light ? (l + 3) / 2 : ((l + 90) / 2)]),
    titleBarBg: accent,
    titleBarFg: hslToHex([h, s, light ? 3 : 90]),
    titleBarOn: hslToHex([h, s, light ? 3 : 90]),
    titleBarOff: hslToHex([h, s, light ? 3 : 90]),
    contentBg: hslToHex([h, min(s, 28), light ? 85 : 15]),
    contentFg: hslToHex([180 - h, min(s, 30), light ? 3 : 90]),
    tableEvenRow: hslToHex([h, min(s, 28), light ? 88 : 12]),
    tableOddRow: hslToHex([h, min(s, 28), light ? 82 : 17]),
    tableBorder: hslToHex([180 - h, min(s, 25), light ? 15 : 88]),
    keywordBg: hslToHex([h, min(s, 20), light ? 90 : 10]),
    keywordBorder: hslToHex([180 - h, min(s, 25), light ? 20 : 75]),
    codeBg: hslToHex([h, min(s, 15), light ? 90 : 8]),
    codeFg: hslToHex([180 - h, min(s, 10), light ? 2 : 95]),
    lists: accent
  };
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
