import { isAfter } from 'date-fns';
import { maxBy } from 'lodash';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ChartTimeSlicer from 'components/Metrics/MetricsGrid/common/ChartTimeSlicer/ChartTimeSlicer';
import MetricsGridTile from 'components/Metrics/MetricsGrid/common/MetricsGridTile/MetricsGridTile';
import AreaChart from 'components/ui/AreaChart';
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
    .map(({ dateTime, cumulativeGlmAmount }) => ({
      x: dateTime,
      y: cumulativeGlmAmount,
    }));

  const chartYDomain = useMemo(() => {
    if (!areaChartData?.length) {
      return undefined;
    }
    const maxValue = maxBy(areaChartData, ({ y }) => y)?.y;
    if (!maxValue) {
      return undefined;
    }
    return [0, maxValue / 0.6];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaChartData?.length]);

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
