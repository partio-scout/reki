import path from 'path';
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'src', 'public', 'build');
const mainPath = path.resolve(__dirname, 'src', 'client', 'main.jsx');

export default {
  mode: 'production',
  entry: mainPath,
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: 'build/',
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx',
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$|\.jsx$/,
        loader: 'babel-loader',
        exclude: [nodeModulesPath],
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css',
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader?outputStyle=expanded',
      },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,   loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,  loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&minetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: 'url-loader?limit=10000&minetype=image/svg+xml' },
    ],
  },
};
