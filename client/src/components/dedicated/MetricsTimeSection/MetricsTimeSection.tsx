import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import Header from 'components/core/Header/Header';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import useDecisionWindow from 'hooks/queries/useDecisionWindow';
import useEpochDuration from 'hooks/queries/useEpochDuration';
import useEpochAndAllocationTimestamps from 'hooks/useEpochAndAllocationTimestamps';

import styles from './style.module.scss';
import MetricsTimeSectionProps from './types';

const MetricsTimeSection: FC<MetricsTimeSectionProps> = ({
  className,
  isDecisionWindowOpen,
  currentEpoch,
  onCountingFinish,
}) => {
  const { data: decisionWindowDuration } = useDecisionWindow();
  const { data: epochDuration } = useEpochDuration();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();

  const counterProps = isDecisionWindowOpen
    ? {
        duration: decisionWindowDuration,
        timestamp: timeCurrentAllocationEnd,
      }
    : {
        duration: epochDuration,
        timestamp: timeCurrentEpochEnd,
      };

  return (
    <div className={className}>
      <Header
        text={isDecisionWindowOpen ? `Epoch ${currentEpoch} Allocation` : `Epoch ${currentEpoch}`}
      />
      {isDecisionWindowOpen && (
        <Description
          text="Allocation is the currently active governance period of the epoch when you can allocate
          funds to projects you want to support."
        />
      )}
      <BoxRounded
        alignment="left"
        isVertical
        title={
          isDecisionWindowOpen
            ? `Epoch ${currentEpoch} Allocation ends in`
            : `Epoch ${currentEpoch} ends in`
        }
      >
        <TimeCounter
          className={styles.timeCounter}
          onCountingFinish={onCountingFinish}
          {...counterProps}
        />
      </BoxRounded>
    </div>
  );
};

export default MetricsTimeSection;
