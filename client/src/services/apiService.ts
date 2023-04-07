import axios from 'axios';

const apiInstance = axios.create({
  data: '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: { 'Content-Type': 'application/json' },
  responseEncoding: 'utf8',
  responseType: 'json',
});

export default apiInstance;
