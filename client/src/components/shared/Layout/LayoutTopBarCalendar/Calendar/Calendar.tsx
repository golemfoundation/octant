import { isAfter, isSameDay, isWithinInterval } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import React, { FC, useCallback, useEffect, useRef } from 'react';

import CalendarItem from 'components/shared/Layout/LayoutTopBarCalendar/CalendarItem';
import getMilestones, { Milestone } from 'constants/milestones';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './Calendar.module.scss';
import CalendarProps from './types';

let isInitialResizeDone = false;

const Calendar: FC<CalendarProps> = ({ showAWAlert, durationToChangeAWInMinutes }) => {
  const dataTestRoot = 'Calendar';
  const constraintsRef = useRef<HTMLDivElement>(null);
  const milestonesWrapperRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMediaQuery();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const milestonesWithIsActive = getMilestones().reduce(
    (acc, curr) => {
      const currentDate = new Date();
      const isActive =
        (curr.to
          ? isWithinInterval(currentDate, {
              end: curr.to,
              start: curr.from,
            })
          : isSameDay(currentDate, curr.from)) ||
        (acc.length > 0 &&
          isAfter(curr.from, currentDate) &&
          !acc.some(element => element.isActive));

      acc.push({
        ...curr,
        isActive,
        isAlert: isActive && showAWAlert && curr.isAllocationWindowMilestone,
      });

      return acc;
    },
    [] as (Milestone & { isActive: boolean; isAlert?: boolean })[],
  );

  const setMotionValue = useCallback(() => {
    const milestoneWithIsActive = milestonesWithIsActive.find(({ isActive }) => isActive);

    if (!milestoneWithIsActive || !constraintsRef.current || !milestonesWrapperRef.current) {
      return;
    }

    const el = document.getElementById(milestoneWithIsActive.id);
    const { top: elTop, left: elLeft } = el!.getBoundingClientRect()!;
    const {
      top: containerTop,
      height: containerHeight,
      left: containerLeft,
      width: containerWidth,
    } = constraintsRef.current!.getBoundingClientRect();
    const { height: milestonesWrapperHeight, width: milestonesWrapperWidth } =
      milestonesWrapperRef.current!.getBoundingClientRect();
    const motionValue = isMobile
      ? y.get() + (elTop > containerTop ? -elTop + containerTop : 0)
      : x.get() + (elLeft > containerLeft ? -elLeft + containerLeft : 0);
    const maxMotionValue = isMobile
      ? milestonesWrapperHeight - containerHeight
      : milestonesWrapperWidth - containerWidth;

    const motionValueToSet = motionValue < -maxMotionValue ? -maxMotionValue : motionValue;
    if (isMobile) {
      y.set(motionValueToSet);
    } else {
      x.set(motionValueToSet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if (!milestonesWrapperRef.current) {
      return;
    }

    setMotionValue();

    const resizeObserver = new ResizeObserver(() => {
      if (!isInitialResizeDone) {
        isInitialResizeDone = true;
        return;
      }

      setMotionValue();
    });
    resizeObserver.observe(milestonesWrapperRef.current);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div className={styles.root} data-test={dataTestRoot}>
      <div ref={constraintsRef} className={styles.constraintsWrapper}>
        <motion.div
          ref={milestonesWrapperRef}
          className={styles.milestonesWrapper}
          data-test={`${dataTestRoot}__wrapper`}
          drag={isMobile ? 'y' : 'x'}
          dragConstraints={constraintsRef}
          style={isMobile ? { y } : { x }}
        >
          {milestonesWithIsActive.map(({ id, ...milestone }) => (
            <CalendarItem
              key={id}
              id={id}
              {...milestone}
              durationToChangeAWInMinutes={durationToChangeAWInMinutes}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Calendar;
