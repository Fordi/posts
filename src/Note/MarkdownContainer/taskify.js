const PATTERN = /^\[(?:[\s_-])?([Xx])?\]\s(.*)/;
const ALL_BOXES = /[-*]\s+\[(?:[\s_-])?([Xx])?\]\s/g;

module.exports = (md, { labelClass, itemClass, listClass, checkboxClass, readOnly = true } = {}) => {
  const checkboxAttrs = {
    type: 'checkbox',
    class: checkboxClass,
    disabled: readOnly,
  };
  md.core.ruler.push('tasks', (state) => {
    const allBoxes = [...state.src.matchAll(ALL_BOXES)].map((match) => match.index + match[0].indexOf('[') + 1);
    if (allBoxes.length === 0) return;
    const { Token, tokens } = state;
    let lists;
    for (let index = 0; index < tokens.length; index += 1) {
      // Is this a checkbox?
      if (
        // must be an inline token
        tokens[index].type !== 'inline'
        // must have text child
        || tokens[index].children[0].type !== 'text'
        // whose content matches the pattern
        || !PATTERN.test(tokens[index].children[0].content)
        // whose immediate parent is a paragraph
        || tokens[index - 1]?.type !== 'paragraph_open'
        // whose immediate parent's immediate parent is a list item
        || tokens[index - 2].type !== 'list_item_open'
      ) continue;
      // Grab the first child of children, the rest should also be within the label
      const [first, ...rest] = tokens[index].children;
      // Grab the checkmark off the text node, leave the label
      const [checked, initLabel] = [...first.content.match(PATTERN)].slice(1);
      tokens[index].children = [
        // This list will be post-processed into nodes
        // args are type, tag, nesting, attributes, content
        // Things that are already tokens just slide right in.
        ['label_open', 'label', 1, { class: labelClass }],
        ['checkbox_input', 'input', 0, { ...checkboxAttrs, checked: !!checked, 'data-pos': allBoxes.shift() }],
        initLabel && ['text', '', 0, null, initLabel],
        ...rest,
        ['label_close', 'label', -1],
      ].filter(a => !!a).map((spec) => Array.isArray(spec)
        ? Object.assign(new Token(...spec.slice(0, 3)), {
          attrs: Object.keys(spec[3] ?? {})
            .filter((key) => !!spec[3][key])
            .map((key) => [key, String(spec[3][key])]),
          content: spec[4],
        })
        : spec
      );
      if (itemClass) {
        // index - 2 is the list item
        tokens[index - 2].attrs = [...(tokens[index - 2].attrs || []), ['class', itemClass]];
      }
      if (listClass) {
        // locate the list item's parent list and add it to a Set for decoration
        if (!lists) lists = new Set();
        let cur = index - 2;
        let listLevel = tokens[cur].level - 1;
        for (; cur >= 0 && tokens[cur].level !== listLevel; cur -= 1);
        if (cur !== -1) {
          lists.add(tokens[cur]);
        }
      }
    }
    // Decorate all the lists we've collated.
    if (listClass) for (const list of lists) {
      list.attrs = [...(list.attrs || []), ['class', listClass]]
    }
  })
};
