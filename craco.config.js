// Enable live dev server usage with Electron by injecting
// the relevant CSP stuff
module.exports = () => ({
  devServer: (conf) => {
    conf.headers['Content-Security-Policy'] = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' 'unsafe-inline' data: blob: notefile: https://* http://*; connect-src 'self' data: notefile: ws:";
    return conf;
  }
});
