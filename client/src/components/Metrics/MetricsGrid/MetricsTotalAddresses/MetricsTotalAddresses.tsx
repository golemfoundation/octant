import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/common/MetricsGridTileValue/MetricsGridTileValue';
import useLockedsData from 'hooks/subgraph/useLockedsData';

import MetricsTotalAddressesProps from './types';

const MetricsTotalAddresses: FC<MetricsTotalAddressesProps> = ({ isLoading = false }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data } = useLockedsData();

  const totalAddressesValue = data?.totalAddresses ? `${data.totalAddresses}` : '';

  return (
    <MetricsGridTile
      groups={[
        {
          children: (
            <MetricsGridTileValue
              isLoading={isLoading}
              showSubvalueLoader={false}
              value={totalAddressesValue}
            />
          ),
          title: t('totalAddresses'),
        },
      ]}
      size="S"
    />
  );
};

export default MetricsTotalAddresses;
