const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './index.jsx'),

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },

  devServer: {
    contentBase: path.join(__dirname, "build"),
    port: 9000
  },

  devtool: 'inline-cheap-module-source-map',

  resolve: {
    alias: {
      'react-editor': path.join(__dirname, '..', 'src/index.tsx'),
    },
    extensions: ['.js' , '.jsx', '.ts', '.tsx']
  },

  module: {
    rules: [{
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react'],
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      }
    }, {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      include: [
        path.resolve(__dirname, '../src'),
      ],
      use: {
        loader: 'ts-loader',
      }
    }],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html')
    }),
    new CopyPlugin({
      patterns: [{
        from: "node_modules/quill/dist/quill.snow.css",
        to: "quill.snow.css"
      }]
    })
  ]

};