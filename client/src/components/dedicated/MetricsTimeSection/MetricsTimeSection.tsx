import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.metricsTimeSection',
  });
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
        text={
          isDecisionWindowOpen
            ? t('epochAllocation', { currentEpoch })
            : t('epoch', {
                currentEpoch,
              })
        }
      />
      {isDecisionWindowOpen && <Description text={t('descriptionText')} />}
      <BoxRounded
        alignment="left"
        isVertical
        title={
          isDecisionWindowOpen
            ? t('epochAllocationEndsIn', { currentEpoch })
            : t('epochEndsIn', {
                currentEpoch,
              })
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
