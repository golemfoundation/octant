import { QueryCache, QueryClient } from 'react-query';

import { triggerToast } from 'utils/triggerToast';

const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        // @ts-expect-error Error is of type 'unknown', but it is an API error.
        triggerToast({ message: `Something went wrong: ${error.message}`, type: 'error' });
      }
    },
  }),
});

export default reactQueryClient;
