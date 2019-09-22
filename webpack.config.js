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
    plugins: ['react-hot-loader/babel'],
  },
});

const tsLoader = {
  loader: 'ts-loader',
  options: {
    configFile: tsconfig,
  },
};

const devServer = argv => isDev(argv) ? {
  contentBase: buildPath,
  hot: true,
  index: '',
  serveIndex: false,
  proxy: {
    context: () => true,
    target: 'http://localhost:3000/',
  },
} : undefined;

module.exports = (env, argv) => ({
  entry: mainPath,
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: 'assets/',
  },
  devtool: isDev(argv) ? 'eval-source-map' : undefined,
  devServer: devServer(argv),
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
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
    ],
  },
});
