const cls = (...list) => [
  ...new Set(
    list
      .reverse()
      .filter(a => !!a)
      .reduce((a, item) => [
        ...a,
        ...String(item).split(' ')
      ], [])
  )
]
  .reverse()
  .join(' ');

export default cls;
