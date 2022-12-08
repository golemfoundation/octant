import { QueryCache, QueryClient } from 'react-query';

import triggerToast from 'utils/triggerToast';

const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: error => {
      // @ts-expect-error Error is of type 'unknown', but it is an API error.
      triggerToast({ message: `Something went wrong: ${error.message}`, type: 'error' });
    },
  }),
});

export default reactQueryClient;
