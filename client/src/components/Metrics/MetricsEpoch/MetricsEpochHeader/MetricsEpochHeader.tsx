import cx from 'classnames';
import { format, isSameYear } from 'date-fns';
import React, { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsHeader from 'components/Metrics/MetricsHeader';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useEpochsStartEndTime from 'hooks/subgraph/useEpochsStartEndTime';
import { arrowRight } from 'svg/misc';

import styles from './MetricsEpochHeader.module.scss';

const MetricsEpochHeader = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { isDesktop } = useMediaQuery();
  const { epoch, lastEpoch, setEpoch } = useMetricsEpoch();

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: epochsStartEndTime } = useEpochsStartEndTime();

  const epochDurationLabel = useMemo(() => {
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

  const isCurrentOpenEpoch = epoch === lastEpoch && isDecisionWindowOpen;
  const isRightArrowDisabled = epoch === lastEpoch;
  const isLeftArrowDisabled = epoch < 2;

  return (
    <MetricsHeader title={t(isDesktop ? 'epochAllocationWindow' : 'epochAllocation', { epoch })}>
      <div className={styles.epochInfo}>
        {isCurrentOpenEpoch ? (
          <div className={styles.badge}>{t('open')}</div>
        ) : (
          <div className={styles.epochDurationLabel}>{epochDurationLabel}</div>
        )}
      </div>
      <div className={styles.arrowsWrapper}>
        <div
          className={cx(styles.arrow, styles.leftArrow, isLeftArrowDisabled && styles.isDisabled)}
          onClick={() => {
            if (isLeftArrowDisabled) {
              return;
            }
            setEpoch(epoch - 1);
          }}
        >
          <Svg img={arrowRight} size={1.4} />
        </div>
        <div
          className={cx(styles.arrow, isRightArrowDisabled && styles.isDisabled)}
          onClick={() => {
            if (isRightArrowDisabled) {
              return;
            }
            setEpoch(epoch + 1);
          }}
        >
          <Svg img={arrowRight} size={1.4} />
        </div>
      </div>
    </MetricsHeader>
  );
};

export default MetricsEpochHeader;
