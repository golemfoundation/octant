import cx from 'classnames';
import { motion } from 'framer-motion';
import { throttle } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { METRICS_EPOCH_ID, METRICS_GENERAL_ID, METRICS_PERSONAL_ID } from 'constants/metrics';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './MetricsNavigation.module.scss';
import { ActiveSection } from './types';

const MetricsNavigation = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { isLargeDesktop } = useMediaQuery();
  const forcedSectionRef = useRef<ActiveSection | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('epoch');
  const throttleCallback = useCallback(throttle, []);

  const steps = [
    {
      label: t('epoch'),
      section: 'epoch',
      sectionId: METRICS_EPOCH_ID,
    },
    {
      label: t('overview'),
      section: 'general',
      sectionId: METRICS_GENERAL_ID,
    },
    {
      label: i18n.t('common.personal'),
      section: 'personal',
      sectionId: METRICS_PERSONAL_ID,
    },
  ];

  const scrollToSection = (sectionId: string, section: ActiveSection) => {
    if (!ref.current) {
      return;
    }

    const { height, marginBottom } = getComputedStyle(ref.current);

    const navigationBoxHeight = parseInt(height, 10);
    const navigationBoxMarginBottom = parseInt(marginBottom, 10);
    const sectionDividerHeight = 48;

    const valueToAddToOffstetTop =
      (section !== 'epoch' ? sectionDividerHeight : 0) -
      (isLargeDesktop ? 0 : navigationBoxHeight + navigationBoxMarginBottom);

    const element = document.getElementById(sectionId)!;

    const scrollToTop = element!.offsetTop + valueToAddToOffstetTop;
    setActiveSection(section);
    const maxScroll = element!.parentElement!.scrollHeight - window.innerHeight;
    if (
      scrollToTop === window.scrollY ||
      (scrollToTop > maxScroll && window.scrollY === maxScroll)
    ) {
      return;
    }

    forcedSectionRef.current = section;
    window.scrollTo({
      behavior: 'smooth',
      top: scrollToTop,
    });
  };

  useEffect(() => {
    const metricsEpochTarget = document.getElementById(METRICS_EPOCH_ID)!;
    const metricsGeneralTarget = document.getElementById(METRICS_GENERAL_ID)!;
    const metricsPersonalTarget = document.getElementById(METRICS_PERSONAL_ID)!;

    const getSectionVisibility = (section: HTMLElement) => {
      const sectionRect = section.getBoundingClientRect();

      const visibility = Math.min(
        Math.max((window.innerHeight - Math.abs(sectionRect.top)) / sectionRect.height, 0),
        1,
      );

      return visibility;
    };

    const scrollEndListener = () => {
      if (!forcedSectionRef.current) {
        return;
      }
      forcedSectionRef.current = null;
    };

    const scrollListener = () => {
      if (forcedSectionRef.current) {
        return;
      }

      const metricsEpochVisibility = getSectionVisibility(metricsEpochTarget);
      const metricsGeneralVisibility = getSectionVisibility(metricsGeneralTarget);
      const metricsPersonalVisibility = getSectionVisibility(metricsPersonalTarget);

      const nextActiveSection = (
        [
          { section: 'epoch', value: metricsEpochVisibility },
          { section: 'general', value: metricsGeneralVisibility },
          { section: 'personal', value: metricsPersonalVisibility },
        ] as { section: ActiveSection; value: number }[]
      ).sort((a, b) => b.value - a.value)[0].section;
      setActiveSection(nextActiveSection);
    };

    const throttledScrollListener = throttleCallback(scrollListener, 100);

    document.addEventListener('scroll', throttledScrollListener);
    document.addEventListener('scrollend', scrollEndListener);

    return () => {
      document.removeEventListener('scroll', throttledScrollListener);
      document.removeEventListener('scrollend', scrollEndListener);
    };
  }, [throttleCallback]);

  return (
    <div ref={ref} className={styles.root}>
      <div className={styles.box}>
        {steps.map(({ section, sectionId, label }) => (
          <div
            key={section}
            className={cx(styles.sectionStep, activeSection === section && styles.isActive)}
            onClick={() => scrollToSection(sectionId, section as ActiveSection)}
          >
            {isLargeDesktop && (
              <>
                <svg className={styles.circleSvg} height={16} viewBox="0 0 16 16" width={16}>
                  <circle className={styles.circle} cx={8} cy={8} r={6} />
                </svg>
                {sectionId !== METRICS_GENERAL_ID && (
                  <div className={styles.smallDotsWrapper}>
                    {[...Array(7).keys()].map(d => (
                      <div key={d} className={styles.smallDot} />
                    ))}
                  </div>
                )}
              </>
            )}
            <span className={styles.label}>{label}</span>
            {!isLargeDesktop && activeSection === section ? (
              <motion.div className={styles.isActiveOverlay} layoutId="overlay" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsNavigation;
