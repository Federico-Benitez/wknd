/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

// Use the AEM Headless SDK to make the GraphQL requests
import AEMHeadless from "@adobe/aem-headless-client-js";

// environment variable for configuring the headless client
const {
  VITE_APP_HOST_URI,
  VITE_APP_USE_PROXY,
  VITE_APP_AUTH_METHOD,
  VITE_APP_DEV_TOKEN,
  VITE_APP_BASIC_AUTH_USER,
  VITE_APP_BASIC_AUTH_PASS,
} = import.meta.env;

// In a production application the serviceURL should be set to the production AEM Publish environment
// In development the serviceURL can be set to '/' which will be a relative proxy is used (see ../authMethods.js) to avoid CORS issues

const serviceURL = VITE_APP_USE_PROXY === "true" ? "/" : VITE_APP_HOST_URI;

// Get authorization based on environment variables
// authorization is not needed when connecting to Publish environments
const setAuthorization = () => {
  if (VITE_APP_AUTH_METHOD === "basic") {
    return [VITE_APP_BASIC_AUTH_USER, VITE_APP_BASIC_AUTH_PASS];
  } else if (VITE_APP_AUTH_METHOD === "dev-token") {
    return VITE_APP_DEV_TOKEN;
  } else {
    // no authentication set
    return;
  }
};

// Initialize the AEM Headless Client and export it for other files to use
const aemHeadlessClient = new AEMHeadless({
  serviceURL: serviceURL,
  auth: setAuthorization(),
});

// Prefix URLs with AEM Host
export function addAemHost(url) {  
  if (url.startsWith("/")) {
    return new URL(url, VITE_APP_HOST_URI).toString();
  }
  return url;
}

export default aemHeadlessClient;