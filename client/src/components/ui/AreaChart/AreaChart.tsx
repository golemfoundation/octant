import { format } from 'date-fns';
import React, { FC, useState } from 'react';
import {
  VerticalGridLines,
  AreaSeries,
  LineSeries,
  Hint,
  MarkSeries,
  LineSeriesPoint,
  FlexibleXYPlot,
} from 'react-vis';
import 'react-vis/dist/style.css';

import getFormattedValueWithSymbolSuffix from 'utils/getFormattedValueWithSymbolSuffix';

import styles from './AreaChart.module.scss';
import AreaChartProps from './types';

const AreaChart: FC<AreaChartProps> = ({
  data,
  className,
  yDomain,
  shouldFormatXValueToDate = false,
  shouldFormatYValue = false,
}) => {
  const [point, setPoint] = useState<LineSeriesPoint | null>(null);

  return (
    <FlexibleXYPlot
      className={className}
      margin={{ bottom: 0, left: 0, right: 0 }}
      onMouseLeave={() => setPoint(null)}
    >
      <VerticalGridLines style={{ strokeDasharray: 4 }} />
      <AreaSeries
        color={styles.colorOctantGreen_15}
        data={data}
        stroke="transparent"
        yDomain={yDomain}
      />
      {point && (
        <Hint value={point} yDomain={yDomain}>
          <div className={styles.hint}>
            <div className={styles.xValue}>
              {shouldFormatXValueToDate ? format(point.x, 'dd MMM, yyyy') : point.x}
            </div>
            <div className={styles.yValue}>
              {shouldFormatYValue
                ? getFormattedValueWithSymbolSuffix({
                    format: 'thousandsAndMillions',
                    precision: 3,
                    value: point.y,
                  })
                : point.y}
            </div>
          </div>
        </Hint>
      )}
      <LineSeries
        data={data}
        onNearestX={datapoint => {
          if (point && datapoint.x === point?.x) {
            return;
          }
          setPoint(datapoint);
        }}
        stroke={styles.colorOctantGreen}
        style={{
          strokeWidth: 4,
        }}
        yDomain={yDomain}
      />
      <MarkSeries
        _sizeValue={4}
        data={point ? [point] : []}
        fill="white"
        opacity={1}
        stroke={styles.colorOctantGreen_50}
        strokeWidth={8}
        style={{ paintOrder: 'stroke' }}
        yDomain={yDomain}
      />
    </FlexibleXYPlot>
  );
};

export default AreaChart;
