import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { handleError } from 'api/errorMessages';

const clientReactQuery = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, query) => {
      // @ts-expect-error Error is of type 'unknown', but it is an API error.
      return handleError(error.reason, query);
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      // @ts-expect-error Error is of type 'unknown', but it is an API error.
      return handleError(error.reason, query);
    },
  }),
});

export default clientReactQuery;
