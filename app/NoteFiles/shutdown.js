const cleanup = require("./cleanup");

module.exports = async function shutdown() {
  await cleanup();
};
