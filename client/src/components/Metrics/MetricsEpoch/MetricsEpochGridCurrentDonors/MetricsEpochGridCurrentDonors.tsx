import uniqBy from 'lodash/uniqBy';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochAllocations from 'hooks/queries/useEpochAllocations';

import MetricsEpochGridCurrentDonorsProps from './types';

const MetricsEpochGridCurrentDonors: FC<MetricsEpochGridCurrentDonorsProps> = ({
  isLoading = false,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch } = useMetricsEpoch();
  const { data: epochAllocations } = useEpochAllocations(epoch);

  const currentDonorsString = uniqBy(epochAllocations, 'donor').length.toString();

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridCurrentDonors"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              showSubvalueLoader={false}
              value={currentDonorsString}
            />
          ),
          title: t('currentDonors'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridCurrentDonors;
