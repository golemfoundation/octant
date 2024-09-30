import cx from 'classnames';
import { format } from 'date-fns';
import { useInView } from 'framer-motion';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg';
import { arrowTopRight } from 'svg/misc';

import styles from './CalendarItem.module.scss';
import CalendarItemProps from './types';

const CalendarItem: FC<CalendarItemProps> = ({ id, label, from, to, isActive, href }) => {
  const { i18n } = useTranslation();
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
      data-test="CalendarItem"
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
      <div className={styles.tile}>
        <div className={styles.day}>{format(from, 'dd')}</div>
        <div className={styles.monthShort}>{format(from, 'MMM')}</div>
      </div>
      <div>
        <div className={styles.label}>
          {label}
          {href && (
            <Svg
              classNameSvg={styles.arrowTopRight}
              dataTest="CalendarItem__Svg--arrowTopRight"
              img={arrowTopRight}
              size={0.8}
            />
          )}
        </div>
        <div className={styles.date}>
          {to
            ? `${i18n.t('common.close')} ${format(to, 'dd MMMM haaa')} CET`
            : `${format(from, 'haaa')} CET`}
        </div>
      </div>
    </div>
  );
};

export default CalendarItem;
