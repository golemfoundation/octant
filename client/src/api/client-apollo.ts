import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

import env from 'env';

import { handleError } from './errorMessages';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors || networkError) {
    handleError('History/loading-encountered-an-error');
  }
});

const httpLink = new HttpLink({ uri: env.subgraphAddress });

const clientApollo = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, httpLink]),
  uri: env.subgraphAddress,
});

export default clientApollo;
