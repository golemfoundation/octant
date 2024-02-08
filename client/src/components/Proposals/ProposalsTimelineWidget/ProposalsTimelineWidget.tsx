import { isAfter, isSameDay, isWithinInterval } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import React, { ReactElement, useLayoutEffect, useRef } from 'react';

import ProposalsTimelineWidgetItem from 'components/Proposals/ProposalsTimelineWidgetItem';
import getMilestones, { Milestone } from 'constants/milestones';

import styles from './ProposalsTimelineWidget.module.scss';

const ProposalsTimelineWidget = (): ReactElement => {
  const constraintsRef = useRef<HTMLDivElement>(null);
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

  useLayoutEffect(() => {
    const milestoneWithIsActive = milestonesWithIsActive.find(({ isActive }) => isActive);

    if (!milestoneWithIsActive) {
      return;
    }

    const el = document.getElementById(milestoneWithIsActive.id);
    const elRight = el!.getBoundingClientRect()!.right;
    const containerRight = constraintsRef.current!.getBoundingClientRect().right;
    const elOffset = 24;

    const xMotionValue = elRight > containerRight ? -elRight - elOffset + containerRight : 0;
    x.set(xMotionValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div className={styles.root}>
      <div ref={constraintsRef} className={styles.constraintsWrapper}>
        <motion.div
          className={styles.milestonesWrapper}
          drag="x"
          dragConstraints={constraintsRef}
          style={{ x }}
        >
          {milestonesWithIsActive.map(({ id, ...milestone }) => (
            <ProposalsTimelineWidgetItem key={id} id={id} {...milestone} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProposalsTimelineWidget;
