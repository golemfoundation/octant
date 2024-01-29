import { isAfter, isSameDay, isWithinInterval } from 'date-fns';
import { motion, useMotionValue } from 'framer-motion';
import React, { ReactElement, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ProposalsTimelineWidgetItem from 'components/Proposals/ProposalsTimelineWidgetItem';

import styles from './ProposalsTimelineWidget.module.scss';
import { Milestone } from './types';

const ProposalsTimelineWidget = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.proposals.proposalsTimelineWidget',
  });
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // LOOK AT ME
  // Each milestone must have a date in the appropriate Europe/Warsaw time zone!
  // Dates only in ISO8601 (Safari)
  const milestones: Milestone[] = [
    {
      from: new Date('2023-11-13T00:00:00+0100'),
      id: 'applications-open',
      label: t('applicationsOpen'),
      to: new Date('2023-12-20T00:00:00+0100'),
    },
    {
      from: new Date('2023-12-22T00:00:00+0100'),
      id: 'project-updates-close',
      label: t('projectUpdatesClose'),
    },
    {
      from: new Date('2024-01-01T00:00:00+0100'),
      id: 'snapshot-vote',
      label: t('snapshotVote'),
      to: new Date('2024-01-05T00:00:00+0100'),
    },
    {
      from: new Date('2024-01-17T00:00:00+0100'),
      id: 'allocation-window',
      label: t('allocationWindow'),
      to: new Date('2024-01-31T00:00:00+0100'),
    },
    {
      from: new Date('2024-01-17T00:00:00+0100'),
      id: 'epoch-starts',
      label: t('epochStarts', { epoch: 'Three' }),
    },
  ];

  const milestonesWithIsActive = milestones.reduce(
    (acc, curr, idx) => {
      const currentDate = new Date();
      const isActive =
        (curr.to
          ? isWithinInterval(currentDate, {
              end: curr.to,
              start: curr.from,
            })
          : isSameDay(currentDate, curr.from)) ||
        (acc.length > 0 && isAfter(curr.from, currentDate) && !acc[idx - 1].isActive);

      acc.push({ ...curr, isActive });

      return acc;
    },
    [] as (Milestone & { isActive: boolean })[],
  );

  useLayoutEffect(() => {
    const { id } = milestonesWithIsActive.find(({ isActive }) => isActive)!;
    const el = document.getElementById(id);
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
