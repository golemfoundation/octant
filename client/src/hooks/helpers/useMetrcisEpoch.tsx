import React, { FC, ReactNode, createContext, useContext, useMemo, useState } from 'react';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

type MetricsEpochContextType = {
  epoch: number;
  lastEpoch: number;
  setEpoch: (epoch: number) => void;
};

export const MetricsEpochContext = createContext<MetricsEpochContextType>({
  epoch: 0,
  lastEpoch: 0,
  setEpoch: () => {},
});

export const MetricsEpochProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const lastEpoch = isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!;
  const [epoch, setEpoch] = useState(lastEpoch);

  const value = useMemo(
    () => ({
      epoch,
      lastEpoch,
      setEpoch,
    }),
    [epoch, lastEpoch],
  );

  return <MetricsEpochContext.Provider value={value}>{children}</MetricsEpochContext.Provider>;
};

export const useMetricsEpoch = (): MetricsEpochContextType => useContext(MetricsEpochContext);

export default useMetricsEpoch;
