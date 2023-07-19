import { useEffect } from 'react';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import { WebsocketListenEvent } from 'types/websocketEvents';

const websocketService = () => import('services/websocketService');

export default function useSubscription<TData>(
  event: WebsocketListenEvent,
  callback: (data: TData) => void,
): void {
  const { data: currentEpoch, isLoading } = useCurrentEpoch();

  useEffect(() => {
    if (isLoading || !currentEpoch || currentEpoch <= 1) {
      return;
    }

    websocketService().then(socket => {
      socket.default.on(event, callback);
    });

    return () => {
      websocketService().then(socket => {
        socket.default.off(event, callback);
      });
    };
  }, [event, callback, currentEpoch, isLoading]);
}
