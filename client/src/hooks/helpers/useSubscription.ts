import { useEffect } from 'react';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import { WebsocketListenEvent } from 'types/websocketEvents';

const websocketService = () => import('services/websocketService');

type UseSubscriptionProps<TData> = {
  callback: (data: TData) => void;
  enabled?: boolean;
  event: WebsocketListenEvent;
};

export default function useSubscription<TData>({
  event,
  callback,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  enabled,
}: UseSubscriptionProps<TData>): void {
  const { data: currentEpoch, isLoading } = useCurrentEpoch();

  useEffect(() => {
    if (!enabled || isLoading || !currentEpoch || currentEpoch <= 1) {
      return;
    }

    websocketService().then(socket => {
      if (socket.default.hasListeners(event)) {
        return;
      }
      socket.default.on(event, data => {
        callback(data);
      });
    });

    return () => {
      websocketService().then(socket => {
        socket.default.off(event, callback);
      });
    };
  }, [event, callback, currentEpoch, isLoading, enabled]);
}
