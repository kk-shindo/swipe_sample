const SRC_DIR = `${__dirname}/src`
const DIST_DIR = `${__dirname}/dist`

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const ImageminMozjpeg = require('imagemin-mozjpeg')

const MODE = 'development'
const enabledSourceMap = MODE === 'development'

module.exports = {
  mode: MODE,
  entry: './src/js/index.js',
  output: {
    path: DIST_DIR,
    filename: 'main.js'
  },
  devServer: {
    contentBase: 'dist',
    open: true
  },
  module: {
  rules: [
  //     {
  //       test: /\.js$/,
  //       exclude:/node_modules/,
  //       loader: "babel-loader",
  //       query: {
  //         presets:[
  //           ["env", {
  //             "targets": {
  //               "node": "current"
  //             }
  //           }]
  //         ]
  //       }
  //     },
      {
        test: /\.css/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: enabledSourceMap,
              importLoaders: 2
            }
          },
        ]
      },
      {
        test: /\.scss/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: enabledSourceMap,
              importLoaders: 2
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: enabledSourceMap
            }
          }
        ]
      },
      {
        test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
        loader: "url-loader"
      },
      // {
      //   test: /\.html$/,
      //   loader: "html-loader"
      // }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/html', to: '' },
        { from: 'src/img', to: 'img' },
      ]
    }),
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: {
        quality: '65-80'
      },
      gifsicle: {
        interlaced: false,
        optimizationLevel: 1,
        colors: 256
      },
      svgo: {
      },
      plugins: [
        ImageminMozjpeg({
          quality: 85,
          progressive: true
        })
      ]
    })
  ]
  // plugins: [
  //   new HtmlWebpackPlugin({
  //     template: "./src/html/index.html"
  //   })
  // ]
}
