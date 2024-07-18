/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const { createProxyMiddleware } = require('http-proxy-middleware');
const session = require('express-session')
const { getToken } = require('@adobe/aem-headless-client-nodejs');
const { VITE_APP_HOST_URI, VITE_APP_SERVICE_TOKEN } = import.meta.env;

/*
    Set up a proxy with AEM for local development
    In a production environment this proxy should be set up at the webserver level or absolute URLs should be used.
*/
module.exports = function(app) {
    // Setup session
    app.use(session({
        secret: 'MY_SECRET',
        resave: false,
        saveUninitialized: true
    }))
    app.use(
        ['/content', '/graphql'],
        function (req, res, next) {
            if (!req.session.accessToken) {
                getToken(VITE_APP_SERVICE_TOKEN)
                    .then(({ accessToken, expires }) => {
                        console.log('Token received', accessToken.length, expires)
                        if (accessToken) {
                            req.session.accessToken = accessToken
                            req.headers.authorization = `Bearer ${accessToken}`
                        }
                        next()
                    })
                    .catch(e => {
                        console.error(e)
                        next()
                    })
            } else {
                req.headers.authorization = `Bearer ${req.session.accessToken}`
                next()
            }
        },
        createProxyMiddleware({
            target: VITE_APP_HOST_URI,
            changeOrigin: true
        })
    );
};

