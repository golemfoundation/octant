import { format, isSameYear } from 'date-fns';
import { useMemo } from 'react';

import useEpochsStartEndTime from 'hooks/subgraph/useEpochsStartEndTime';

import useMediaQuery from './useMediaQuery';

export default function useEpochDurationLabel(epoch: number | undefined): string {
  const { isDesktop } = useMediaQuery();
  const { data: epochsStartEndTime } = useEpochsStartEndTime();

  return useMemo(() => {
    if (!epoch || !epochsStartEndTime) {
      return '';
    }

    const epochData = epochsStartEndTime[epoch - 1];
    const epochStartTimestamp = parseInt(epochData.fromTs, 10) * 1000;
    const epochEndTimestampPlusDecisionWindowDuration =
      (parseInt(epochData.toTs, 10) + parseInt(epochData.decisionWindow, 10)) * 1000;

    const isEpochEndedAtTheSameYear = isSameYear(
      epochStartTimestamp,
      epochEndTimestampPlusDecisionWindowDuration,
    );

    const epochStartLabel = format(
      epochStartTimestamp,
      `${isDesktop ? 'dd MMMM' : 'MMM'} ${isEpochEndedAtTheSameYear ? '' : 'yyyy'}`,
    );
    const epochEndLabel = format(
      epochEndTimestampPlusDecisionWindowDuration,
      `${isDesktop ? 'dd MMMM' : 'MMM'} yyyy`,
    );

    return `${epochStartLabel} -> ${epochEndLabel}`;
  }, [epoch, epochsStartEndTime, isDesktop]);
}
