import axios from 'axios';

const apiInstance = axios.create({
  data: '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: { 'Content-Type': 'application/json' },
  responseEncoding: 'utf8',
  responseType: 'json',
});

/**
 * Solves the problem of axios throwing CanceledError in the console with Abort from React.
 * From here: https://stackoverflow.com/a/73635264
 */
apiInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_CANCELED') {
      // aborted in useEffect cleanup.
      return Promise.resolve({ status: 499 });
    }
    return Promise.reject((error.response && error.response.data) || 'Error');
  },
);

export default apiInstance;
