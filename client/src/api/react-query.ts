import { QueryCache, QueryClient } from 'react-query';

const reactQueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        /* eslint-disable no-console */
        // @ts-expect-error: type of the error is not known.
        console.error('React Query Error: ', JSON.stringify(error.message));
        /* eslint-enable no-console */
      }
    },
  }),
});

export default reactQueryClient;
