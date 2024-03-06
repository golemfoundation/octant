import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useMetricsEpoch from 'hooks/helpers/useMetrcisEpoch';
import useEpochPatrons from 'hooks/queries/useEpochPatrons';

import MetricsEpochGridPatronsProps from './types';

const MetricsEpochGridPatrons: FC<MetricsEpochGridPatronsProps> = ({
  isLoading = false,
  className,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { epoch } = useMetricsEpoch();
  const { data: epochPatrons } = useEpochPatrons(epoch);

  const patrons = `${epochPatrons?.length || 0}`;

  return (
    <MetricsGridTile
      className={className}
      dataTest="MetricsEpochGridPatrons"
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              showSubvalueLoader={false}
              value={patrons}
            />
          ),
          title: t('patrons'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsEpochGridPatrons;
