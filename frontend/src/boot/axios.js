import { boot } from "quasar/wrappers";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

axios.defaults.headers.common["Authorization"] =
  "Basic ZFc1cGJXVmtjbTl1Wkc5dWIzQnZiR2x6OllUTm1OREpoTVdRdE1XVXhZeTAwWldaaUxUZzJaRGd0TVRNNU16RTBNamc1Wmprdw==";
const api = axios.create({
  baseURL: "https://api-rest.in/api/appraisal/",
  Accept: "application/json,application/pdf",
  crossDomain: true,
  cache: false,
  withCredentials: false,
  headers: {
    "Content-type": "application/json",
    "Accept-Ranges": "bytes",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE, PUT",
    "Access-Control-Expose-Headers":
      "Accept-Ranges, Content-Encoding, Content-Length, Content-Range",
  },
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
