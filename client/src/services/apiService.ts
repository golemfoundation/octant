import axios from 'axios';
import xhrAdapter from 'axios/lib/adapters/xhr';

const apiInstance = axios.create({
  adapter: xhrAdapter,
  data: '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: { 'Content-Type': 'application/json' },
  responseEncoding: 'utf8',
  responseType: 'json',
});

export default apiInstance;
