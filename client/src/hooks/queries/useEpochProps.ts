import { useQuery, useQueries } from 'react-query';

import useContractEpochs from 'hooks/contracts/useContractEpochs';

export interface EpochProps {
  decisionWindow: number;
  duration: number;
  from: number;
  to: number;
}

export default function useEpochProps(): EpochProps[] {
  const contractEpochs = useContractEpochs();

  const epochPropsIndex = useQuery(['epochPropsIndex'], () => contractEpochs?.epochPropsIndex(), {
    enabled: !!contractEpochs,
    select: response => response?.toNumber(),
  });

  const epochProps = useQueries(
    [...Array(epochPropsIndex.data).keys()].map(index => ({
      enabled: !!epochPropsIndex && !!epochPropsIndex.data,
      queryFn: () => contractEpochs?.epochProps(index),
      queryKey: ['epochProps', index],
      select: response => {
        const [from, to, duration, decisionWindow] = response;
        return {
          decisionWindow: decisionWindow.toNumber() * 1000,
          duration: duration.toNumber() * 1000,
          from: from.toNumber(),
          to: to.toNumber(),
        };
      },
    })),
  );

  const isEpochPropsLoading =
    epochProps.length === 0 || epochProps.some(({ isLoading }) => isLoading);

  if (isEpochPropsLoading || !epochPropsIndex || !epochPropsIndex.data) {
    return [];
  }

  return epochProps.map(epochPropsElement => epochPropsElement.data!);
}
