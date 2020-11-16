const Path = require('path');
const dir = (...args) => Path.resolve(__dirname, ...args);
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin  = require('copy-webpack-plugin');

module.exports = {
  entry: dir('src/index.tsx'),

  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
    ],
  },

  externals: {
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

  output: {
    path: dir('dist'),
    filename: 'react-editor.js',
    library: 'ReactEditor',
    libraryTarget: 'umd',
  },

  devServer: {
    contentBase: dir('dist'),
    stats: 'errors-only',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "node_modules/quill/dist/quill.bubble.css", to: "quill.bubble.css" },
        { from: "node_modules/quill/dist/quill.snow.css", to: "quill.snow.css" },
        { from: "node_modules/quill/dist/quill.core.css", to: "quill.core.css" },
      ]
    })
  ]

}; 