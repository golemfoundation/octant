import { ApolloClient, InMemoryCache } from '@apollo/client';

import env from 'env';

const clientApollo = new ApolloClient({
  cache: new InMemoryCache(),
  uri: env.subgraphAddress,
});

export default clientApollo;
