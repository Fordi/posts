// Enable live dev server usage with Electron by injecting
// the relevant CSP stuff
module.exports = () => ({
  devServer: (conf) => {
    conf.headers['Content-Security-Policy'] = "default-src 'self'; style-src 'self' 'unsafe-inline'";
    return conf;
  }
});
