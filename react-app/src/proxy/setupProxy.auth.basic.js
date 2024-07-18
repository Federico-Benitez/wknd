/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const { createProxyMiddleware } = require('http-proxy-middleware');
const { VITE_APP_HOST_URI, VITE_APP_BASIC_AUTH_USER, VITE_APP_BASIC_AUTH_PASS } = import.meta.env;

/*
    Set up a proxy with AEM for local development
    In a production environment this proxy should be set up at the webserver level or absolute URLs should be used.
*/
module.exports = function(app) {
  app.use(
    ['/content', '/graphql'],
    createProxyMiddleware({
      target: VITE_APP_HOST_URI,
      changeOrigin: true,
      // pass in credentials when developing against an Author environment
      auth: `${VITE_APP_BASIC_AUTH_USER}:${VITE_APP_BASIC_AUTH_PASS}`
    })
  );
};

