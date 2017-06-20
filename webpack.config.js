const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');

module.exports = {
  entry: {
    'app': './'
  },

  externals: {},

  output: {
    path: path.resolve('public/build'),
    filename: '[name].bundle.js',
    publicPath: '/assets/' // always stars and ends with a slash
  },

  module: {
    rules: [{
      test: /\.jsx?$/,
      include: [
        path.resolve('src')
      ],
      loader: 'babel-loader'
    },
    {
      test: /\.s?css$/,
      use: extractCSS.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'postcss-loader', 'sass-loader']
      })
    }]
  },

  plugins: [
    extractCSS,
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      Tether: 'tether'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function(module) {
        if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
          return false;
        }
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    })
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },

  devtool: 'source-map',
  context: path.resolve(__dirname, 'src'),
  target: 'web',
  stats: 'minimal',

  devServer: {
    proxy: {
      '*': 'http://localhost:3000'
    },
    contentBase: path.resolve(__dirname, 'public'),
    compress: true,
    historyApiFallback: true,
    noInfo: true
  }
};
