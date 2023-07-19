import { io } from 'socket.io-client';

import env from 'env';

export default io(env.websocketEndpoint, { withCredentials: true });
