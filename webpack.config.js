const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyPlugin  = require('copy-webpack-plugin');

const env = process.env.NODE_ENV;

const config = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'umd'),
    filename: 'react-editor.js',
    library: 'ReactEditor',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
    ],
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },

  externals: {
    'quill': {
      'commonjs': 'quill',
      'commonjs2': 'quill',
      'amd': 'quill',
      'root': 'Quill'
    },
    'react': {
      'commonjs': 'react',
      'commonjs2': 'react',
      'amd': 'react',
      'root': 'React'
    },
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    },
    'react-dom/server': {
      'commonjs': 'react-dom/server',
      'commonjs2': 'react-dom/server',
      'amd': 'react-dom/server',
      'root': 'ReactDOMServer'
    }
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    new CopyPlugin({
      patterns: [
        { from: "node_modules/quill/dist/quill.bubble.css", to: "quill.bubble.css" },
        { from: "node_modules/quill/dist/quill.snow.css", to: "quill.snow.css" },
        { from: "node_modules/quill/dist/quill.core.css", to: "quill.core.css" },
      ]
    })
  ]
}; 

if (env === 'analyse') {
  config.plugins.push(
    new BundleAnalyzerPlugin()
  );
}

if (env === 'development') {
  config.mode = 'development';
  config.devtool = 'source-map';
}

if (env === 'production') {
  config.mode = 'production';
}

module.exports = config;