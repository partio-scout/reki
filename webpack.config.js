/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'dist', 'public');
const mainPath = path.resolve(__dirname, 'src', 'client', 'main.jsx');
const tsconfig = path.resolve(__dirname, 'src', 'client', 'tsconfig.json');

const isDev = argv => argv.mode === 'development';

const babelLoader = argv => ({
  loader: 'babel-loader',
  options: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 3,
          modules: false,
        },
      ],
      [
        '@babel/preset-react',
        {
          development: isDev(argv),
        },
      ],
    ],
  },
});

const tsLoader = {
  loader: 'ts-loader',
  options: {
    configFile: tsconfig,
  },
};

module.exports = (env, argv) => ({
  entry: mainPath,
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: 'assets/',
  },
  devtool: isDev(argv) ? 'eval-source-map' : undefined,
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [nodeModulesPath],
        use: [babelLoader(argv)],
      },
      {
        test: /\.tsx?$/,
        exclude: [nodeModulesPath],
        use: [babelLoader(argv), tsLoader],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,  loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&minetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&minetype=image/svg+xml' },
    ],
  },
});
