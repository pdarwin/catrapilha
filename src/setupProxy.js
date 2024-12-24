const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/comapi", {
      target: "https://commons.wikimedia.org",
      changeOrigin: true,
      pathRewrite: {
        "^/comapi/": "",
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
    })
  );
  app.use(
    createProxyMiddleware("/flickrapi", {
      target: "https://www.flickr.com/",
      changeOrigin: true,
      pathRewrite: {
        "^/flickrapi": "",
      },
    })
  );
  app.use(
    createProxyMiddleware("/pmpa1api", {
      target: "https://bancodeimagens.portoalegre.rs.gov.br",
      changeOrigin: true,
      pathRewrite: {
        "^/pmpa1api": "",
      },
    })
  );
};
