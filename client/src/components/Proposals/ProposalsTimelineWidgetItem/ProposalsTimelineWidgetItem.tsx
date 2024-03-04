import cx from 'classnames';
import { format } from 'date-fns';
import { useInView } from 'framer-motion';
import React, { FC, useRef, useState } from 'react';

import Svg from 'components/ui/Svg';
import { arrowRight, arrowTopRight } from 'svg/misc';

import styles from './ProposalsTimelineWidgetItem.module.scss';
import ProposalsTimelineWidgetItemProps from './types';

const ProposalsTimelineWidgetItem: FC<ProposalsTimelineWidgetItemProps> = ({
  id,
  label,
  from,
  to,
  isActive,
  href,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 'all' });
  const [initialClientX, setInitialClientX] = useState<number | null>(null);

  return (
    <div
      ref={ref}
      className={cx(
        styles.root,
        isActive && styles.isActive,
        isInView && styles.isInView,
        href && styles.hasHref,
      )}
      id={id}
      onMouseDown={e => {
        if (!href) {return;}
        setInitialClientX(e.clientX);
      }}
      onMouseUp={e => {
        if (!href) {return;}
        if (initialClientX === e.clientX) {
          window.open(href, '_blank');
        }

        setInitialClientX(null);
      }}
    >
      <div className={styles.label}>
        {label}
        {href && <Svg classNameSvg={styles.arrowTopRight} img={arrowTopRight} size={0.8} />}
      </div>
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
