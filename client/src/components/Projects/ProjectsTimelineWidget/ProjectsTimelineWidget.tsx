import { isAfter, isSameDay, isWithinInterval } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import React, { ReactElement, useCallback, useEffect, useRef } from 'react';

import ProjectsTimelineWidgetItem from 'components/Projects/ProjectsTimelineWidgetItem';
import getMilestones, { Milestone } from 'constants/milestones';

import styles from './ProjectsTimelineWidget.module.scss';

let isInitialResizeDone = false;

const ProjectsTimelineWidget = (): ReactElement => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const milestonesWrapperRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

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

      acc.push({ ...curr, isActive });

      return acc;
    },
    [] as (Milestone & { isActive: boolean })[],
  );

  const setXValue = useCallback(() => {
    const milestoneWithIsActive = milestonesWithIsActive.find(({ isActive }) => isActive);

    if (!milestoneWithIsActive || !constraintsRef.current || !milestonesWrapperRef.current) {
      return;
    }

    const el = document.getElementById(milestoneWithIsActive.id);
    const { left: elLeft } = el!.getBoundingClientRect()!;
    const { left: containerLeft, width: containerWidth } =
      constraintsRef.current!.getBoundingClientRect();
    const { width: milestonesWrapperWidth } = milestonesWrapperRef.current!.getBoundingClientRect();
    const xMotionValue = x.get() + (elLeft > containerLeft ? -elLeft + containerLeft : 0);
    const maxXValue = milestonesWrapperWidth - containerWidth;

    x.set(xMotionValue < -maxXValue ? -maxXValue : xMotionValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!milestonesWrapperRef.current) {
      return;
    }
    setXValue();

    const resizeObserver = new ResizeObserver(() => {
      if (!isInitialResizeDone) {
        isInitialResizeDone = true;
        return;
      }

      setXValue();
    });
    resizeObserver.observe(milestonesWrapperRef.current);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div className={styles.root} data-test="ProjectsTimelineWidget">
      <div ref={constraintsRef} className={styles.constraintsWrapper}>
        <motion.div
          ref={milestonesWrapperRef}
          className={styles.milestonesWrapper}
          drag="x"
          dragConstraints={constraintsRef}
          style={{ x }}
        >
          {milestonesWithIsActive.map(({ id, ...milestone }) => (
            <ProjectsTimelineWidgetItem key={id} id={id} {...milestone} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectsTimelineWidget;
