import { isAfter } from 'date-fns';
import { maxBy } from 'lodash';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileTimeSlicer from 'components/Metrics/MetricsGrid/MetricsGridTileTimeSlicer';
import AreaChart from 'components/ui/AreaChart';
import useLockedSummarySnapshots from 'hooks/subgraph/useLockedSummarySnapshots';

import styles from './MetricsGeneralGridCumulativeGlmLocked.module.scss';

const MetricsGeneralGridCumulativeGlmLocked: FC = () => {
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
      className={styles.root}
      dataTest="MetricsGeneralGridCumulativeGlmLocked"
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
          hasTitleLargeBottomPadding: true,
          title: t('cumulativeGlmLocked'),
          titleSuffix: <MetricsGridTileTimeSlicer onValueChange={setDateToFilter} />,
        },
      ]}
      size="custom"
    />
  );
};

export default MetricsGeneralGridCumulativeGlmLocked;
