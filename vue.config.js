const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "http://fe.faisys.com/office/" : "http://127.0.0.1:8080/",
  chainWebpack: config => {
    // config.entry('app').add(require('./node_modules/pdfjs-dist/es5/build/pdf.worker.js'));
    // config.module.noParse(/pdf\.worker\.js/);

    // config.module.rule('worker').test(/\.worker\.js$/).use('worker-loader').loader('worker-loader');
    config.output.filename('js/[name].js');
    config.output.chunkFilename('js/[name].js');

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
            test: /[\\/]node_modules\/.*vue\//,
            priority: 10,
          },
          'vendor-pdfjs-dist': {
            name: 'chunk-pdfjs',
            test: /[\\/]node_modules\/.*pdfjs-dist\//,
            priority: 10,
          },
          vendors: {
            name: `chunk-vendors`,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
        }
      })

    config.plugin("copy").use(CopyWebpackPlugin, [{
      patterns: [{
        from: path.resolve("node_modules", "pdfjs-dist/es5/build/pdf.worker.js"),
        to: path.resolve(config.output.get("path"), "js")
      }]
    }])
  },
};