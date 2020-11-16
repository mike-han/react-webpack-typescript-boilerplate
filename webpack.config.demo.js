const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin  = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/demo/index.jsx'),

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './demo')
  },

  devServer: {
    contentBase: path.join(__dirname, "demo"),
    port: 9000
  },

  devtool: 'inline-cheap-module-source-map',

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },

  module: {
    rules: [
      { test: /\.jsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/demo/index.html')
    }),
    new CopyPlugin({
      patterns: [
        { from: "node_modules/quill/dist/quill.snow.css", to: "quill.snow.css" }
      ]
    })
  ]

}; 