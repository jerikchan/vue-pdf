module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/pdf/" : "",
  chainWebpack: config => {
    // const workerRule = config.module.rule('worker');
    // workerRule
    //   .test(/\.worker\.js$/)
    //   .use("worker-loader")
    //   .loader("worker-loader");

    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  }
};