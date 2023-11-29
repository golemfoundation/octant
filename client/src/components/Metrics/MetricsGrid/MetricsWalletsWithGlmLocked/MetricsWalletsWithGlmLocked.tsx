import { isAfter } from 'date-fns';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AreaChart from 'components/core/AreaChart/AreaChart';
import ChartTimeSlicer from 'components/Metrics/MetricsGrid//common/ChartTimeSlicer/ChartTimeSlicer';
import MetricsGridTile from 'components/Metrics/MetricsGrid//common/MetricsGridTile/MetricsGridTile';
import useLockedsData from 'hooks/subgraph/useLockedsData';

import styles from './MetricsWalletsWithGlmLocked.module.scss';

const MetricsWalletsWithGlmLocked: FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data } = useLockedsData();

  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);

  const areaChartData = data?.groupedByDate
    .filter(({ dateTime }) => {
      if (!dateToFilter) {
        return true;
      }
      return isAfter(dateTime, dateToFilter);
    })
    .map(({ dateTime, users }) => ({
      x: dateTime,
      y: users.length,
    }));

  const chartYDomain = data
    ? [0, data.groupedByDate[data.groupedByDate.length - 1].users.length / 0.6]
    : undefined;

  return (
    <MetricsGridTile
      dataTest="MetricsWalletsWithGlmLocked"
      groups={[
        {
          children: (
            <div className={styles.areaChartWrapper}>
              <AreaChart
                className={styles.areaChart}
                data={areaChartData}
                shouldFormatXValueToDate
                yDomain={chartYDomain}
              />
            </div>
          ),
          title: t('walletsWithGlmLocked'),
          titleSuffix: <ChartTimeSlicer onValueChange={setDateToFilter} />,
        },
      ]}
      size="L"
    />
  );
};

export default MetricsWalletsWithGlmLocked;
