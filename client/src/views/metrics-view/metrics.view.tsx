import { formatUnits } from 'ethers/lib/utils';
import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Counter from 'components/dedicated/counter/counter.component';
import DoubleValue from 'components/core/double-value/double-value.component';
import Header from 'components/core/header/header.component';
import MainLayout from 'layouts/main-layout/main.layout';
import ProgressBar from 'components/core/progress-bar/progress-bar.component';
import useCurrentEpoch from 'hooks/useCurrentEpoch';
import useDecisionWindow from 'hooks/useDecisionWindow';
import useEpochDuration from 'hooks/useEpochDuration';
import useEthStaked from 'hooks/useEthStaked';
import useGlmStaked from 'hooks/useGlmStaked';
import useIsDecisionWindowOpen from 'hooks/useIsDecisionWindowOpen';
import useStakedRatio from 'hooks/useStakedRatio';
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
  const { data: glmStaked } = useGlmStaked();
  const { data: stakedRatio } = useStakedRatio();
  const { data: ethStaked } = useEthStaked();

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
      <div className={styles.element}>
        <Header text="Value Staked" />
        <div className={styles.description}>
          The total value staked on Hexagon to date, showing ETH staked by the Golem Foundation and
          GLM staked by Hexagon users.
        </div>
        <BoxRounded alignment="left" className={styles.box} isVertical title="ETH Staked">
          <DoubleValue mainValue={ethStaked || '0.0'} />
        </BoxRounded>
        <BoxRounded alignment="left" className={styles.box} isVertical title="GLM Staked">
          <DoubleValue mainValue={glmStaked ? formatUnits(glmStaked) : '0.0'} />
        </BoxRounded>
        <BoxRounded
          alignment="left"
          className={styles.box}
          isVertical
          title="GLM Staked as % of Total Supply"
        >
          <DoubleValue mainValue={`${stakedRatio || '0.0'}%`} />
          <ProgressBar
            className={styles.stakedRatioProgressBar}
            progressPercentage={stakedRatio ? parseFloat(stakedRatio) : 0}
          />
        </BoxRounded>
      </div>
    </MainLayout>
  );
};

export default MetricsView;
