const API = require('./API/index.js');
const Notes = require('./Notes/index.js');

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