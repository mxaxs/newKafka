import { boot } from "quasar/wrappers";
import { createApolloProvider } from "@vue/apollo-option";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  cache,
  uri: "https://nexarxm.top/v1/graphql",
  headers: {
    "x-hasura-admin-secret": "esteehomeusegred0qu3f01descoberto",
  },
  connectToDevTools: true,
});
const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: "no-cache",
    },
  },
});

export default boot(async ({ app }) => {
  app.setup = () => {
    provide(DefaultApolloClient, apolloClient);
    return {};
  };
  app.use(apolloProvider);
  app.provide(apolloProvider, apolloClient);
});
