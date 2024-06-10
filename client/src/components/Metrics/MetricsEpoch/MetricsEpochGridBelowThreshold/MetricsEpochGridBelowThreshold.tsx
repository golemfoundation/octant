import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useProjectsDonors from 'hooks/queries/donors/useProjectsDonors';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useMatchedProjectRewards from 'hooks/queries/useMatchedProjectRewards';
import i18n from 'i18n';

import MetricsEpochGridBelowThresholdProps from './types';

const MetricsEpochGridBelowThreshold: FC<MetricsEpochGridBelowThresholdProps> = ({
  isLoading,
  className,
  ethBelowThreshold,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch, lastEpoch } = useMetricsEpoch();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { data: matchedProjectRewards } = useMatchedProjectRewards(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );
  const { data: projectsDonors } = useProjectsDonors(
    isDecisionWindowOpen && epoch === lastEpoch ? undefined : epoch,
  );

  const getValuesToDisplay = useGetValuesToDisplay();

  const projectsBelowThreshold =
    Object.keys(projectsDonors).length -
    (matchedProjectRewards?.filter(({ matched }) => matched !== 0n).length || 0);

  const ethBelowThresholdToDisplay = getValuesToDisplay({
    cryptoCurrency: 'ethereum',
    valueCrypto: ethBelowThreshold,
  });

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridBelowThreshold"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              size="S"
              subvalue={i18n.t('common.projects').toUpperCase()}
              value={projectsBelowThreshold.toString()}
            />
          ),
          title: t('belowThreshold'),
        },
        {
          children: (
            <MetricsGridTileValue
              dataTest="MetricsEpochGridBelowThreshold__ethBelowThreshold"
              isLoading={isLoading}
              size="S"
              subvalue={ethBelowThresholdToDisplay.secondary}
              value={ethBelowThresholdToDisplay.primary}
            />
          ),
          title: t('ethBelowThreshold'),
        },
      ]}
      size="M"
    />
  );
};

export default MetricsEpochGridBelowThreshold;
