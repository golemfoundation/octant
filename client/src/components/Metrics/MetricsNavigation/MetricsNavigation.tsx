import cx from 'classnames';
import { motion } from 'framer-motion';
import { throttle } from 'lodash';
import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LAYOUT_BODY_ID ,
  METRICS_EPOCH_ID,
  METRICS_GENERAL_ID,
  METRICS_PERSONAL_ID,
} from 'constants/domElementsIds';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './MetricsNavigation.module.scss';
import { ActiveSection } from './types';

const MetricsNavigation = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { isLargeDesktop } = useMediaQuery();
  const forcedSectionRef = useRef<ActiveSection | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('epoch');
  const [activeDot, setActiveDot] = useState(1);
  const throttleCallback = useCallback(throttle, []);
  const numberOfDots = 8;

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
    setActiveDot(1);
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
    const layoutBodyTarget = document.getElementById(LAYOUT_BODY_ID)!;

    const layoutComputedStyle = getComputedStyle(layoutBodyTarget);

    const layoutBodyHeight = parseInt(layoutComputedStyle.height, 10);
    const layoutBodyPaddingTop = parseInt(layoutComputedStyle.paddingTop, 10);
    const layoutBodyPaddingBottom = parseInt(layoutComputedStyle.paddingBottom, 10);

    const layoutBodyWithoutVerticalPadding =
      layoutBodyHeight - layoutBodyPaddingTop - layoutBodyPaddingBottom;

    const scrollHeightWithoutPaddingTop =
      layoutBodyHeight - window.innerHeight - layoutBodyPaddingTop;

    const percentageScrollShareEpochSection =
      metricsEpochTarget.clientHeight / layoutBodyWithoutVerticalPadding;
    const percentageScrollShareGeneralSection =
      metricsGeneralTarget.clientHeight / layoutBodyWithoutVerticalPadding;

    const scrollShareEpochSection =
      percentageScrollShareEpochSection * scrollHeightWithoutPaddingTop;
    const scrollShareGeneralSection =
      percentageScrollShareGeneralSection * scrollHeightWithoutPaddingTop;

    const stepEpochSection =
      (percentageScrollShareEpochSection * scrollHeightWithoutPaddingTop) / 8;
    const stepGeneralSection =
      (percentageScrollShareGeneralSection * scrollHeightWithoutPaddingTop) / 8;

    const scrollEndListener = () => {
      if (!forcedSectionRef.current) {
        return;
      }

      setTimeout(() => {
        forcedSectionRef.current = null;
      }, 100);
    };

    const scrollListener = () => {
      if (forcedSectionRef.current) {
        return;
      }

      const scrollYWithoutPaddingTop = window.scrollY - layoutBodyPaddingTop;

      if (scrollYWithoutPaddingTop <= scrollShareEpochSection) {
        setActiveSection('epoch');
        setActiveDot(
          scrollYWithoutPaddingTop < 0 ? 1 : Math.ceil(scrollYWithoutPaddingTop / stepEpochSection),
        );
        return;
      }

      if (
        scrollYWithoutPaddingTop > scrollShareEpochSection &&
        scrollYWithoutPaddingTop <= scrollShareEpochSection + scrollShareGeneralSection
      ) {
        setActiveSection('general');
        setActiveDot(
          Math.ceil((scrollYWithoutPaddingTop - scrollShareEpochSection) / stepGeneralSection),
        );
        return;
      }

      setActiveSection('personal');
      setActiveDot(1);
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
            className={cx(
              styles.sectionStep,
              activeSection === section && activeDot === 1 && styles.isActive,
            )}
            onClick={() => scrollToSection(sectionId, section as ActiveSection)}
          >
            {isLargeDesktop && (
              <>
                <svg className={styles.circleSvg} height={16} viewBox="0 0 16 16" width={16}>
                  <circle className={styles.circle} cx={8} cy={8} r={6} />
                </svg>
                {sectionId !== METRICS_PERSONAL_ID && (
                  <div
                    className={cx(
                      styles.smallDotsWrapper,
                      sectionId === METRICS_GENERAL_ID && styles.transformDots,
                    )}
                  >
                    {[...Array(numberOfDots - 1).keys()].map(i => (
                      <div
                        key={i}
                        className={cx(
                          styles.smallDot,
                          activeSection === section && activeDot - 2 === i && styles.isActive,
                        )}
                      />
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
