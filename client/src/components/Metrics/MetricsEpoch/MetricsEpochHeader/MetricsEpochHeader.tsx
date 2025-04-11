import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsSectionHeader from 'components/Metrics/MetricsSectionHeader';
import NavigationArrows from 'components/shared/NavigationArrows';
import { TOURGUIDE_ELEMENT_8 } from 'constants/domElementsIds';
import useEpochDurationLabel from 'hooks/helpers/useEpochDurationLabel';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';

import styles from './MetricsEpochHeader.module.scss';

const MetricsEpochHeader = (): ReactElement => {
  const dataTestRoot = 'MetricsEpochHeader';
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
      dataTest={dataTestRoot}
      title={t(isDesktop ? 'epochAllocationWindow' : 'epochAllocation', { epoch })}
    >
      <div className={styles.epochInfo}>
        {isCurrentOpenEpoch ? (
          <div className={styles.badge} data-test={`${dataTestRoot}__openBadge`}>
            {t('open')}
          </div>
        ) : (
          <div className={styles.epochDurationLabel} data-test={`${dataTestRoot}__epochDuration`}>
            {epochDurationLabel}
          </div>
        )}
      </div>
      <NavigationArrows
        className={styles.arrows}
        classNamePrevButton={styles.arrowLeft}
        dataTest={`${dataTestRoot}__NavigationArrows`}
        idArrowPrevious={TOURGUIDE_ELEMENT_8}
        isNextButtonDisabled={isRightArrowDisabled}
        isPrevButtonDisabled={isLeftArrowDisabled}
        onClickNextButton={() => setEpoch(epoch + 1)}
        onClickPrevButton={() => setEpoch(epoch - 1)}
      />
    </MetricsSectionHeader>
  );
};

export default MetricsEpochHeader;
