import * as path from "path";
import * as webpack from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

const isProduction = process.env.NODE_ENV == "production";
const isTSCheck = !!process.env.TSCHECK;

const config: webpack.Configuration = {
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, `dist/cjs`),
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  externals: {
    react: "react",
  },
  plugins: [],
};

if (isProduction) {
  config.mode = "production";
} else {
  config.mode = "development";
  config.devtool = "inline-source-map";
  if (isTSCheck) {
    config.plugins?.push(
      new ForkTsCheckerWebpackPlugin({
        async: false,
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
        },
      })
    );
  }
}

export default config;
