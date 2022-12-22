import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Counter from 'components/dedicated/counter/counter.component';
import Header from 'components/core/header/header.component';
import MainLayout from 'layouts/main-layout/main.layout';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useDecisionWindow from 'hooks/useDecisionWindow';
import useEpochDuration from 'hooks/useEpochDuration';
import useIsDecisionWindowOpen from 'hooks/useIsDecisionWindowOpen';
import useStart from 'hooks/useStart';

import getEpochAndAllocationTimestamps from './utils';
import styles from './style.module.scss';

const MetricsView = (): ReactElement => {
  const { data: currentEpoch, refetch: refetchCurrentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });
  const { data: decisionWindowDuration } = useDecisionWindow();
  const { data: epochDuration } = useEpochDuration();
  const { data: startTimestamp } = useStart();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = getEpochAndAllocationTimestamps({
    currentEpoch,
    decisionWindowDuration,
    epochDuration,
    startTimestamp,
  });

  const onCountingFinish = () => {
    refetchCurrentEpoch();
  };

  return (
    <MainLayout>
      <div className={styles.element}>
        <Header text={`Epoch ${currentEpoch}`} />
        <BoxRounded isVertical title={`Epoch ${currentEpoch} ends in`}>
          <Counter
            duration={epochDuration}
            onCountingFinish={onCountingFinish}
            timestamp={timeCurrentEpochEnd}
          />
        </BoxRounded>
      </div>
      <div className={styles.element}>
        <Header text={`Epoch ${currentEpoch} Allocation`} />
        <div className={styles.description}>
          Allocation is the currently active governance period of the epoch when you can allocate
          funds to projects you want to support.
        </div>
        <BoxRounded
          isVertical
          title={
            isDecisionWindowOpen
              ? `Epoch ${currentEpoch} Allocation ends in`
              : 'Allocation is now closed'
          }
        >
          {isDecisionWindowOpen && (
            <Counter
              duration={decisionWindowDuration}
              onCountingFinish={onCountingFinish}
              timestamp={timeCurrentAllocationEnd}
            />
          )}
        </BoxRounded>
      </div>
    </MainLayout>
  );
};

export default MetricsView;
