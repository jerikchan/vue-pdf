const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  publicPath: process.env.VUE_APP_CDN_URL,
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');
    config.module.rule('svg').uses.clear();
    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');

    config.optimization
      .splitChunks({
        chunks: 'all',
        cacheGroups: {
          'vendor-vue': {
            name: 'chunk-vue',
            test: /[\\/]node_modules[\\/].*vue[\\/]/,
            priority: 10,
          },
          'vendor-pdfjs-dist': {
            name: 'chunk-pdfjs',
            test: /[\\/]node_modules[\\/].*pdfjs-dist[\\/]/,
            priority: 10,
          },
          vendors: {
            name: `chunk-vendors`,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
        }
      })

    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    config.plugin("html").tap(args => {
      Object.assign(args, {
        template: path.resolve("public/index.html"),
      });

      return args;
    })

    config.plugin("copy").use(CopyWebpackPlugin, [{
      patterns: [{
        from: path.resolve("node_modules", "pdfjs-dist/es5/build/pdf.worker.js"),
        to: path.resolve(config.output.get("path"), process.env.VUE_APP_PDF_WORKER_URL),
      }]
    }])

    // console.log(config.plugins)
  },
};