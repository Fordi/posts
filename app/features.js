const Notes = require('./Notes/feature.js');

const Main = {
  menuItems: () => [
    { role: 'quit' }
  ],
  init: () => {},
}

module.exports = [
  Notes,
  Main,
];