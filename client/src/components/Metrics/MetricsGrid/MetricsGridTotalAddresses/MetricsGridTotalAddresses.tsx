import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileValue from 'components/Metrics/MetricsGrid/MetricsGridTileValue';
import useLockedsData from 'hooks/subgraph/useLockedsData';

import MetricsGridTotalAddressesProps from './types';

const MetricsGridTotalAddresses: FC<MetricsGridTotalAddressesProps> = ({ isLoading = false }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data } = useLockedsData();

  const totalAddressesValue = data?.totalAddresses ? `${data.totalAddresses}` : '';

  return (
    <MetricsGridTile
      dataTest="MetricsTotalAddresses"
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

export default MetricsGridTotalAddresses;
