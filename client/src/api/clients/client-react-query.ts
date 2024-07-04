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
      // @ts-expect-error Error is of type 'unknown', but it is API or contract error.
      if (error.code === 'ERR_CANCELED') {
        // When request is canceled by the client, do nothing.
        return;
      }
      /**
       * error.cause.code 4001 identifies user denial of request / transaction rejection.
       * https://docs.metamask.io/wallet/reference/rpc-api/#returns-2
       */
      // @ts-expect-error Error is of type 'unknown', but it is API or contract error.
      const hasUserRejectedTransaction = error?.cause?.code === 4001 || error?.code === 4001;
      // @ts-expect-error Error is of type 'unknown', but it is API or contract error.
      const reason = hasUserRejectedTransaction ? 4001 : error.reason;
      return handleError(reason, query);
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      // @ts-expect-error Error is of type 'unknown', but it is API or contract error.
      return handleError(error.reason, query);
    },
  }),
});

// Expose clientReactQuery for Cypress to get the data and verify it.
if (window.Cypress) {
  window.clientReactQuery = clientReactQuery;
}

export default clientReactQuery;
