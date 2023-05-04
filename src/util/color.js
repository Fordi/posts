const { min, max, round } = Math;

export const rgbToHsv = (rgb) => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const v = max(r, g, b);
  var d = v - min(r, g, b);
  return hsv([
    (d ? (
      v === r ? (g - b) / d + (g < b ? 6 : 0)
      : v === g ? (b - r) / d + 2
      : ((r - g) / d + 4)
    ) : 0) * 60,
    v ? 100 * d / v : 0,
    v * 100,
  ]);
};

export const hsv = (inp) => Object.defineProperties(inp, {
  rotate: { value: (t) => hsv([(inp[0] + t + 360) % 360, inp[1], inp[2]]) },
  setValue: { value: (v) => hsv([inp[0], inp[1], v]) },
  lighten: { value: (v) => hsv([inp[0], inp[1], inp[2] + (100 - inp[2]) * v]) },
  darken: { value: (v) => hsv([inp[0], inp[1], inp[2] * (1 - v)]) },
  setSat: { value: (v) => hsv([inp[0], v, inp[2]]) },
  saturate: { value: (v) => hsv([inp[0], inp[1] + (100 - inp[1]) * v, inp[2]]) },
  desaturate: { value: (v) => hsv([inp[0], inp[1] * (1 - v), inp[2]]) },
  contrast: { value(v) { return inp[2] > 50 ? this.darken(v).desaturate(v) : this.lighten(v).desaturate(v); } },
  toHex: { value: () => rgbToHex(hsvToRgb(inp)) },
  toRgb: { value: () => hsvToRgb(inp) },
  toRgba: { value: (a) => `rgba(${hsvToRgb(inp).join(',')}, ${a})`},
  hsv: { value: true },
});

hsv.fromHex = hex => rgbToHsv(hexToRgb(hex));

window.hsv = hsv;

export const hsvToRgb = ([h, s, v]) => {
  let a, b, d, c, e, f;
  h = h / 60;
  h = (0 > h ? h % 6 + 6 : h) % 6;
  a = h | 0;
  b = h - a;
  s = s / 100;
  c = s * b;
  v = 255 * v / 100;
  d = round(v);
  e = round(v * (1 - (a & 1 ? c : (s - c))));
  f = round(v * (1 - s));
  return (
    a === 0 ? [d, e, f]
    : a === 1 ? [e, d, f]
    : a === 2 ? [f, d, e]
    : a === 3 ? [f, e, d]
    : a === 4 ? [e, f, d]
    : [d, f, e]
  );
};

export const hexToRgb = hex => {
  if (hex.startsWith('#')) return hexToRgb(hex.substring(1));
  if (hex.length === 3) return [...hex].map(c => parseInt(c, 16) * 17);
  return [hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6)].map(c => parseInt(c, 16));
};

export const rgbToHex = (rgb) => {
  try {
    return `#${rgb.map(c => (c | 0).toString(16).padStart(2, '0').toUpperCase()).join('')}`;
  } catch (e) {
    debugger;
  }
}

export const hsvToHex = (hslc) => rgbToHex(hsvToRgb(hslc));

export const hsvToAlpha = (hsv, a) => `rgba(${hsvToRgb(hsv).join(',')}, ${a})`
