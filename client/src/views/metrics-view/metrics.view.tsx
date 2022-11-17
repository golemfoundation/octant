import { useQuery } from 'react-query';
import React, { ReactElement } from 'react';

import { useEpochsContract } from 'hooks/useContract';
import TimeCounter from 'components/dedicated/time-counter/time-counter.compoent';
import env from 'env';
import getDurationBetweenTimestamps from 'utils/getDurationBetweenTimestamps';

const MetricsView = (): ReactElement => {
  const { epochsAddress } = env;
  const contractEpochs = useEpochsContract(epochsAddress);

  const { data: start } = useQuery(['start'], () => contractEpochs?.start(), {
    enabled: !!contractEpochs,
  });
  const { data: epochDuration } = useQuery(
    ['epochDuration'],
    () => contractEpochs?.epochDuration(),
    { enabled: !!contractEpochs },
  );
  const { data: currentEpoch } = useQuery(
    ['currentEpoch'],
    () => contractEpochs?.getCurrentEpoch(),
    { enabled: !!contractEpochs },
  );
  const epochDurationNumber = epochDuration?.toNumber();
  const startNumber = start?.toNumber();
  const timeSinceStart = startNumber ? getDurationBetweenTimestamps(startNumber) : undefined;

  const endCurrentEpoch =
    startNumber && epochDurationNumber && currentEpoch
      ? startNumber + epochDurationNumber * currentEpoch
      : undefined;
  const startCurrentEpoch =
    endCurrentEpoch && epochDurationNumber ? endCurrentEpoch - epochDurationNumber : undefined;

  const timeSinceStartOfCurrentEpoch = startCurrentEpoch
    ? getDurationBetweenTimestamps(startCurrentEpoch)
    : undefined;
  const timeToEndOfCurrentEpoch = endCurrentEpoch
    ? getDurationBetweenTimestamps(endCurrentEpoch)
    : undefined;

  return (
    <div>
      <TimeCounter duration={timeSinceStart} label="Time passed since the start of Epoch 1" />
      <br />
      <TimeCounter
        duration={timeSinceStartOfCurrentEpoch}
        label="Time passed since the start of current Epoch"
      />
      <br />
      <TimeCounter duration={timeToEndOfCurrentEpoch} label="Time to the end of current Epoch" />
      <br />
      <div>
        Epoch duration: {epochDurationNumber ? `${epochDurationNumber} seconds` : 'Loading...'}
      </div>
      <br />
      <div>Epoch number: {currentEpoch || 'Loading...'}</div>
    </div>
  );
};

export default MetricsView;
