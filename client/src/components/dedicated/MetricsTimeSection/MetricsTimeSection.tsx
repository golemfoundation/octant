import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Description from 'components/core/Description/Description';
import Header from 'components/core/Header/Header';
import TimeCounter from 'components/dedicated/TimeCounter/TimeCounter';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useCurrentEpochProps from 'hooks/queries/useCurrentEpochProps';

import styles from './MetricsTimeSection.module.scss';
import MetricsTimeSectionProps from './types';

const MetricsTimeSection: FC<MetricsTimeSectionProps> = ({
  className,
  isDecisionWindowOpen,
  currentEpoch,
  onCountingFinish,
}) => {
  const { data: currentEpochProps } = useCurrentEpochProps();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();

  const counterProps = isDecisionWindowOpen
    ? {
        duration: currentEpochProps?.decisionWindow,
        timestamp: timeCurrentAllocationEnd,
      }
    : {
        duration: currentEpochProps?.duration,
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
