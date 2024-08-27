import { motion } from 'framer-motion';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MarkSeries, XYPlot, ArcSeries, Hint } from 'react-vis';

import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './PieChart.module.scss';
import { PieChartProps } from './types';
import { getPieChartData } from './utils';

const RADIUS = 72;

const PieChart: FC<PieChartProps> = ({ data, isLoading }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<any>();
  const [activeTargetId, setActiveTargetId] = useState();
  const { isDesktop } = useMediaQuery();

  const pieChartData = getPieChartData(data, RADIUS);

  const backgroundCircleData = useMemo(
    () => [{ angle: 1 * Math.PI * 2, angle0: 0, color: 0, radius: RADIUS, radius0: RADIUS }],
    [],
  );

  const showDatapoint = useCallback(
    (datapoint, e) => {
      setPoint({
        ...datapoint,
        ...(isDesktop
          ? {
              angle: Math.abs(datapoint.angle - 0.5 * Math.PI),
              angle0: Math.abs(datapoint.angle0 - 0.5 * Math.PI),
            }
          : {}),
      });
      e.event.target.classList.add(styles.dataCirclePath__isActive);
      e.event.target.id = datapoint.id;
      setActiveTargetId(datapoint.id);
    },
    [isDesktop],
  );

  const hideDatapoint = useCallback(
    (_datapoint, e) => {
      const nextTarget = document.elementFromPoint(e.event.clientX, e.event.clientY);
      if (nextTarget?.tagName === 'circle' || activeTargetId === nextTarget?.id) {
        return;
      }
      e.event.target.classList.remove(styles.dataCirclePath__isActive);
      setPoint(undefined);
    },
    [activeTargetId],
  );

  const handleOnValueMouseOutMarkSeries = useCallback(
    (_datapoint, e) => {
      const nextTarget = document.elementFromPoint(e.event.clientX, e.event.clientY);
      if (nextTarget?.id === activeTargetId) {
        return;
      }

      setPoint(null);
      document
        .querySelector(`.${styles.dataCirclePath__isActive}`)
        ?.classList.remove(styles.dataCirclePath__isActive);
    },
    [activeTargetId],
  );

  const getX = useCallback(
    ({ angle, angle0 }) => Math.round((RADIUS - 1) * Math.sin(angle - (angle - angle0) / 2)),
    [],
  );
  const getY = useCallback(
    ({ angle, angle0 }) => Math.round((RADIUS - 1) * Math.cos(angle - (angle - angle0) / 2)),
    [],
  );

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    const listener = e => {
      if ((ref.current && ref.current.contains(e.target)) || !point) {
        return;
      }
      setPoint(null);
    };

    document.addEventListener('click', listener);

    return () => document.removeEventListener('click', listener);
  }, [isDesktop, point]);

  if (!pieChartData) {
    return null;
  }

  return (
    <div ref={ref} className={styles.root}>
      <XYPlot
        height={169}
        margin={0}
        radiusDomain={[0, 84]}
        width={169}
        xDomain={[-84, 84]}
        yDomain={[-84, 84]}
      >
        {/* Background big circle */}
        <ArcSeries
          arcClassName={styles.backgroundBigCircle}
          colorRange={[styles.colorOctantGrey3]}
          colorType="category"
          data={backgroundCircleData}
          radiusType="literal"
        />
        {/* Background circle */}
        <ArcSeries
          arcClassName={styles.backgroundCircle}
          colorRange={[styles.colorOctantGrey1]}
          colorType="category"
          data={backgroundCircleData}
          radiusType="literal"
        />
        {isLoading ? (
          <motion.svg
            className={styles.circleLoaderSvg}
            height="169"
            viewBox="0 0 169 169"
            width="169"
          >
            <motion.circle
              animate={{ pathLength: [0.2, 0.3, 0.2], rotate: 360 }}
              className={styles.circleLoader}
              cx="84.5"
              cy="84.5"
              r="72"
              transition={{
                duration: 1.2,
                ease: 'linear',
                repeat: Infinity,
              }}
            />
          </motion.svg>
        ) : (
          <ArcSeries
            arcClassName={styles.dataCirclePath}
            colorType="literal"
            data={pieChartData}
            getX={datapoint => {
              if (!datapoint.x) {
                return 0;
              }
              return getX(datapoint);
            }}
            getY={datapoint => {
              if (!datapoint.y) {
                return 0;
              }
              return getY(datapoint);
            }}
            onNearestXY={(datapoint, e) => {
              if (isDesktop) {
                return;
              }
              showDatapoint(datapoint, e);
            }}
            onValueMouseOut={hideDatapoint}
            onValueMouseOver={isDesktop ? showDatapoint : undefined}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error lack of property in types
            padAngle={(2 * Math.PI) / 100}
            radiusType="literal"
          />
        )}
        <MarkSeries
          _sizeValue={4}
          className={styles.markPoint}
          data={point ? [point] : []}
          fill="white"
          getX={getX as any}
          getY={getY as any}
          onValueMouseOut={handleOnValueMouseOutMarkSeries}
          opacity={1}
          stroke={point ? point.color : ''}
          strokeWidth={8}
          style={{ paintOrder: 'stroke', strokeOpacity: 0.5 }}
        />
        {point && (
          <Hint
            align={{
              horizontal: 'left',
            }}
            getX={getX as any}
            getY={getY as any}
            style={{ zIndex: 1 }}
            value={point}
          >
            <div className={styles.hint} style={{ backgroundColor: point.color }}>
              <div className={styles.xValue}>{point.label}</div>
              <div className={styles.yValue}>{point.valueLabel}</div>
            </div>
          </Hint>
        )}
      </XYPlot>
      {!isLoading && (
        <div className={styles.percentage}>{`${point ? point.percentageValue : 100}%`}</div>
      )}
    </div>
  );
};

export default PieChart;
