import { isAfter } from 'date-fns';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AreaChart from 'components/core/AreaChart/AreaChart';
import ChartTimeSlicer from 'components/Metrics/MetricsGrid/common/ChartTimeSlicer/ChartTimeSlicer';
import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import useLockedSummarySnapshots from 'hooks/subgraph/useLockedSummarySnapshots';

import styles from './MetricsCumulativeGlmLocked.module.scss';

const MetricsCumulativeGlmLocked: FC = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { data } = useLockedSummarySnapshots();

  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);

  const areaChartData = data?.groupedByDate
    .filter(({ dateTime }) => {
      if (!dateToFilter) {
        return true;
      }
      return isAfter(dateTime, dateToFilter);
    })
    .map(({ dateTime, cummulativeGlmAmount }) => ({
      x: dateTime,
      y: cummulativeGlmAmount,
    }));

  const chartYDomain = data
    ? [0, data.groupedByDate[data.groupedByDate.length - 1].cummulativeGlmAmount / 0.6]
    : undefined;

  return (
    <MetricsGridTile
      dataTest="MetricsCumulativeGlmLocked"
      groups={[
        {
          children: (
            <div className={styles.areaChartWrapper}>
              <AreaChart
                className={styles.areaChart}
                data={areaChartData}
                shouldFormatXValueToDate
                shouldFormatYValue
                yDomain={chartYDomain}
              />
            </div>
          ),
          title: t('cumulativeGlmLocked'),
          titleSuffix: <ChartTimeSlicer onValueChange={setDateToFilter} />,
        },
      ]}
      size="L"
    />
  );
};

export default MetricsCumulativeGlmLocked;
