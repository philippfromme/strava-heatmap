const HtmlWebPackPlugin = require('html-webpack-plugin');

const { DefinePlugin } = require('webpack');

require('dotenv').config();

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      'process.env.CLIENT_ID': JSON.stringify(process.env.CLIENT_ID),
      'process.env.CLIENT_SECRET': JSON.stringify(process.env.CLIENT_SECRET),
      'process.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.REDIRECT_URL': JSON.stringify(process.env.REDIRECT_URL)
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html'
    })
  ]
};