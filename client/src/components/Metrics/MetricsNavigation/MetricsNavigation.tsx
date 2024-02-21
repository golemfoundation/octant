import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { METRICS_EPOCH_ID, METRICS_GENERAL_ID, METRICS_PERSONAL_ID } from 'constants/metrics';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './MetricsNavigation.module.scss';
import { ActiveSection } from './types';

const MetricsNavigation = (): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { isDesktop } = useMediaQuery();
  const forcedSectionRef = useRef<ActiveSection | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('epoch');

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

    const valueToSubstractFromOffstetTop =
      navigationBoxHeight +
      navigationBoxMarginBottom -
      (section !== 'epoch' ? sectionDividerHeight : 0);

    const element = document.getElementById(sectionId)!;
    forcedSectionRef.current = section;
    setActiveSection(section);
    window.scrollTo({
      behavior: 'smooth',
      top: element!.offsetTop - valueToSubstractFromOffstetTop,
    });
  };

  useEffect(() => {
    const metricsEpochTarget = document.getElementById(METRICS_EPOCH_ID)!;
    const metricsGeneralTarget = document.getElementById(METRICS_GENERAL_ID)!;
    const metricsPersonalTarget = document.getElementById(METRICS_PERSONAL_ID)!;

    const callback = entries => {
      entries.forEach(entry => {
        if (!entry.intersectionRatio) {return;}

        if (!entry.isIntersecting) {
          if (metricsPersonalTarget.isSameNode(entry.target)) {
            setActiveSection('general');
            return;
          }

          if (metricsGeneralTarget.isSameNode(entry.target)) {
            if (entry.intersectionRect.bottom < entry.boundingClientRect.bottom) {
              setActiveSection('epoch');
              return;
            }

            setActiveSection('personal');
            return;
          }

          return;
        }

        if (metricsGeneralTarget.isSameNode(entry.target)) {
          if (forcedSectionRef.current !== null && forcedSectionRef.current !== 'general') {
            return;
          }

          forcedSectionRef.current = null;
          setActiveSection('general');
          return;
        }

        if (metricsPersonalTarget.isSameNode(entry.target)) {
          if (forcedSectionRef.current !== null && forcedSectionRef.current !== 'personal') {
            return;
          }

          forcedSectionRef.current = null;
          setActiveSection('personal');
          return;
        }

        if (forcedSectionRef.current !== null && forcedSectionRef.current !== 'epoch') {
          return;
        }

        forcedSectionRef.current = null;
        setActiveSection('epoch');
      });
    };

    const observer = new IntersectionObserver(callback, {
      threshold: isDesktop ? 0.8 : 0.5,
    });

    observer.observe(metricsEpochTarget);
    observer.observe(metricsGeneralTarget);
    observer.observe(metricsPersonalTarget);

    return () => {
      observer.unobserve(metricsEpochTarget);
      observer.unobserve(metricsGeneralTarget);
      observer.unobserve(metricsPersonalTarget);
    };
  }, [isDesktop]);

  return (
    <div ref={ref} className={styles.root}>
      {steps.map(({ section, sectionId, label }) => (
        <div
          key={section}
          className={cx(styles.sectionStep, activeSection === section && styles.isActive)}
          onClick={() => scrollToSection(sectionId, section as ActiveSection)}
        >
          {label}
          {activeSection === section ? (
            <motion.div className={styles.isActiveOverlay} layoutId="overlay" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default MetricsNavigation;
