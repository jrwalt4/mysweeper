const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('./webpack.config.js');
const compiler = webpack(config);
const server = new WebpackDevServer(compiler);

// Serve the files on port 3000.
server.listen(3000, function () {
  console.log('Example app listening on port 3000!\n');
});
