import React, { FC, ReactNode, createContext, useContext, useMemo, useState } from 'react';

import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

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
  const lastEpoch = currentEpoch! - 1;
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
