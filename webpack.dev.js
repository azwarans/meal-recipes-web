const os = require("os");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();
const port = 8080;

module.exports = merge(common, {
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    port,
    disableHostCheck: true,
    stats: "minimal",
    clientLogLevel: "silent"
  },
  plugins: [
    {
      apply(compiler) {
        compiler.hooks.done.tap("DevServerUrlPlugin", (stats) => {
          if (!stats.hasErrors()) {
            console.log("\n  App running at:");
            console.log(`  - Local:   http://localhost:${port}/`);
            console.log(`  - Network: http://${localIp}:${port}/\n`);
          }
        });
      }
    }
  ]
});
