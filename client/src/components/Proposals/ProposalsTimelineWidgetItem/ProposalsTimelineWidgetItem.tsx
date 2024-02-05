import cx from 'classnames';
import { format } from 'date-fns';
import { useInView } from 'framer-motion';
import React, { FC, useRef } from 'react';

import Svg from 'components/ui/Svg';
import { arrowRight } from 'svg/misc';

import styles from './ProposalsTimelineWidgetItem.module.scss';
import ProposalsTimelineWidgetItemProps from './types';

const ProposalsTimelineWidgetItem: FC<ProposalsTimelineWidgetItemProps> = ({
  id,
  label,
  from,
  to,
  isActive,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 'all' });

  return (
    <div
      ref={ref}
      className={cx(styles.root, isActive && styles.isActive, isInView && styles.isInView)}
      id={id}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.date}>
        <div>{format(from, 'dd MMM yyyy')}</div>
        {to && (
          <div>
            <Svg classNameSvg={styles.arrow} img={arrowRight} size={0.8} />
            {format(to, 'dd MMM yyyy')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalsTimelineWidgetItem;
