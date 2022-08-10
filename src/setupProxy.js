const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/comapi", {
      target: "https://commons.wikimedia.org",
      changeOrigin: true,
      pathRewrite: {
        "^/comapi": "",
      },
      onProxyReq: function (request) {
        request.setHeader("origin", "https://commons.wikimedia.org");
      },
    })
  );
  app.use(
    createProxyMiddleware("/arqapi", {
      target: "https://www.arquipelagos.pt",
      changeOrigin: true,
      pathRewrite: {
        "^/arqapi": "",
      },
      onProxyReq: function (request) {
        request.setHeader("origin", "https://www.arquipelagos.pt");
      },
    })
  );
  app.use(
    createProxyMiddleware("/flickrapi", {
      target: "https://www.flickr.com/",
      changeOrigin: true,
      pathRewrite: {
        "^/flickrapi": "",
      },
      onProxyReq: function (request) {
        request.setHeader("origin", "https://www.flickr.com/");
      },
    })
  );
};
