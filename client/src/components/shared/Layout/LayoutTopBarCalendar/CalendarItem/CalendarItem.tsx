/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import cx from 'classnames';
import { format } from 'date-fns';
import { useInView } from 'framer-motion';
import React, { FC, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg';
import { arrowTopRight } from 'svg/misc';

import styles from './CalendarItem.module.scss';
import CalendarItemProps from './types';

const CalendarItem: FC<CalendarItemProps> = ({
  id,
  label,
  from,
  to,
  isActive,
  href,
  shouldUseThirdPersonSingularVerb,
  isAlert,
  isHourVisible = true,
  durationToChangeAWInMinutes,
}) => {
  const dataTestRoot = 'CalendarItem';
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'layout.topBar' });
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 'all' });
  const [initialClientX, setInitialClientX] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const date = useMemo(() => {
    if (to) {
      let dateFormat = format(to, 'dd MMMM haaa');

      if (isAlert && isHovered) {
        const durationToChangeAWInHours = Math.floor(durationToChangeAWInMinutes / 60);
        const durationHours = `${durationToChangeAWInHours} ${t('hours', { count: durationToChangeAWInHours })}`;

        const durationMinutes = `${durationToChangeAWInMinutes} ${t('minutes', { count: durationToChangeAWInMinutes })}`;

        const duration = durationToChangeAWInMinutes <= 60 ? durationMinutes : durationHours;

        dateFormat = `${t('in')} ${duration}`;
      }

      if (shouldUseThirdPersonSingularVerb) {
        return `${i18n.t('common.closes')} ${dateFormat}`;
      }
      return `${i18n.t('common.close')} ${dateFormat}`;
    }

    return format(from, 'haaa');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    to?.getTime(),
    isAlert,
    isHovered,
    durationToChangeAWInMinutes,
    shouldUseThirdPersonSingularVerb,
    i18n.language,
  ]);

  return (
    <div
      ref={ref}
      className={cx(
        styles.root,
        isActive && styles.isActive,
        isInView && styles.isInView,
        href && styles.hasHref,
        isAlert && styles.isAlert,
      )}
      data-is-active={isActive}
      data-test={dataTestRoot}
      id={id}
      onMouseDown={e => {
        if (!href) {
          return;
        }
        setInitialClientX(e.clientX);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseOver={() => setIsHovered(true)}
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
      <div className={styles.tile} data-test={`${dataTestRoot}__title`}>
        <div className={styles.day} data-test={`${dataTestRoot}__title__day`}>
          {format(from, 'dd')}
        </div>
        <div className={styles.monthShort} data-test={`${dataTestRoot}__title__monthShort`}>
          {format(from, 'MMM')}
        </div>
      </div>
      <div>
        <div className={styles.label} data-test={`${dataTestRoot}__label`}>
          {label}
          {href && (
            <Svg
              classNameSvg={styles.arrowTopRight}
              data-test={`${dataTestRoot}__Svg--arrowTopRight`}
              img={arrowTopRight}
              size={0.8}
            />
          )}
        </div>
        {isHourVisible && (
          <div className={styles.date} data-test={`${dataTestRoot}__date`}>
            {date}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarItem;
