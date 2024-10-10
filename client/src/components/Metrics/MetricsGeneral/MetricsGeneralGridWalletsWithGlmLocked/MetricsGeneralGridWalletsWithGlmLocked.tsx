import { isAfter } from 'date-fns';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import MetricsGridTile from 'components/Metrics/MetricsGrid/MetricsGridTile';
import MetricsGridTileTimeSlicer from 'components/Metrics/MetricsGrid/MetricsGridTileTimeSlicer';
import AreaChart from 'components/ui/AreaChart';
import useLockedsData from 'hooks/subgraph/useLockedsData';

import styles from './MetricsGeneralGridWalletsWithGlmLocked.module.scss';

const MetricsGeneralGridWalletsWithGlmLocked: FC = () => {
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
      className={styles.root}
      dataTest="MetricsGeneralGridWalletsWithGlmLocked"
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
          hasTitleLargeBottomPadding: true,
          title: t('walletsWithGlmLocked'),
          titleSuffix: <MetricsGridTileTimeSlicer onValueChange={setDateToFilter} />,
        },
      ]}
      size="custom"
    />
  );
};

export default MetricsGeneralGridWalletsWithGlmLocked;
