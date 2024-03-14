import cx from 'classnames';
import { format } from 'date-fns';
import { useInView } from 'framer-motion';
import React, { FC, useRef, useState } from 'react';

import Svg from 'components/ui/Svg';
import { arrowRight, arrowTopRight } from 'svg/misc';

import styles from './ProjectsTimelineWidgetItem.module.scss';
import ProjectsTimelineWidgetItemProps from './types';

const ProjectsTimelineWidgetItem: FC<ProjectsTimelineWidgetItemProps> = ({
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
      data-test="ProjectsTimelineWidgetItem"
      id={id}
      onMouseDown={e => {
        if (!href) {
          return;
        }
        setInitialClientX(e.clientX);
      }}
      onMouseUp={e => {
        if (!href) {
          return;
        }
        if (initialClientX === e.clientX) {
          // workaround for cypress test
          window.open(href, window.Cypress ? '_self' : '_blank');
        }

        setInitialClientX(null);
      }}
    >
      <div className={styles.label}>
        {label}
        {href && (
          <Svg
            classNameSvg={styles.arrowTopRight}
            dataTest="ProjectsTimelineWidgetItem__Svg--arrowTopRight"
            img={arrowTopRight}
            size={0.8}
          />
        )}
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

export default ProjectsTimelineWidgetItem;
