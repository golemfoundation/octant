import cx from 'classnames';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsSectionHeader from 'components/Metrics/MetricsSectionHeader';
import Svg from 'components/ui/Svg';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { arrowRight } from 'svg/misc';

import styles from './MetricsEpochHeader.module.scss';

const MetricsEpochHeader = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { isDesktop } = useMediaQuery();
  const { epoch, lastEpoch, setEpoch } = useMetricsEpoch();

  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const epochDurationLabel = useEpochDurationLabel(epoch);

  const isCurrentOpenEpoch = epoch === lastEpoch && isDecisionWindowOpen;
  const isRightArrowDisabled = epoch === lastEpoch;
  const isLeftArrowDisabled = epoch < 2;

  return (
    <MetricsSectionHeader
      title={t(isDesktop ? 'epochAllocationWindow' : 'epochAllocation', { epoch })}
    >
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
    </MetricsSectionHeader>
  );
};

export default MetricsEpochHeader;
