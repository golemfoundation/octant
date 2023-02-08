import { MutationCache, QueryCache, QueryClient } from 'react-query';

import { handleError } from './errorMessages';

const clientReactQuery = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onError: error => {
      // @ts-expect-error Error is of type 'unknown', but it is an API error.
      handleError(error.reason);
    },
  }),
  queryCache: new QueryCache({
    onError: error => {
      // @ts-expect-error Error is of type 'unknown', but it is an API error.
      handleError(error.reason);
    },
  }),
});

export default clientReactQuery;
