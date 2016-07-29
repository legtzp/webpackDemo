// Dependencies.

const path              = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge             = require('webpack-merge');
const validate          = require('webpack-validator');

const parts = require('./libs/parts');

// Environmente Variable

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;


const PATHS = {
  frontend: path.join(__dirname, 'frontend'),
  backend:  path.join(__dirname, 'backend'),
  style:    path.join(__dirname, 'frontend', 'main.css'),
  build:    path.join(__dirname, 'build')
};

const common = {

  entry: {
    style:    PATHS.style,
    frontend: PATHS.frontend
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

var config;

switch(TARGET) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          publicPath: '/webpackDemo/',
          filename: '[name].[chunkhash].js',
          // This is used for require.ensure. The setup
          // will work without but this is useful to set.
          chunkFilename: '[chunkhash].js'
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.extractBundle({
        name: 'vendor',
        entries: ['babel-polyfill', 'react']
      }),
      parts.minify(),
      parts.extractJS(PATHS.frontend),
      parts.extractCSS(PATHS.frontend)
    );
    break;

  default:
    config = merge(
        common,
        {devtool: 'eval-source-map'},
        parts.devServer({
          // Customize host/port here if needed
          host: process.env.HOST,
          port: process.env.PORT
        }),
        parts.extractJS(PATHS.frontend),
        parts.extractCSS(PATHS.style),
        parts.purifyCSS([PATHS.frontend])
      );
}

// Run validator in quiet mode to avoid output in stats
module.exports = validate(config, {
  quiet: true
});
