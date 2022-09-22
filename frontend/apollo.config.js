"use strict";
/* eslint-env node */
// See https://www.apollographql.com/docs/devtools/apollo-config/
module.exports = {
  client: {
    service: {
      name: "nexar-xm",
      url: "https://nexarxm.top/v1/graphql",
      headers: {
        "x-hasura-admin-secret": "esteehomeusegred0qu3f01descoberto",
      },
    },
    // Files processed by the extension
    includes: ["src/**/*.vue", "src/**/*.js", "src/**/*.ts"],
  },
};
