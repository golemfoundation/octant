import { useQueryClient } from '@tanstack/react-query';
import cx from 'classnames';
import {
  AnimatePresence,
  motion,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import usePatronMode from 'hooks/mutations/usePatronMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './SettingsPatronModeSlider.module.scss';
import SettingsPatronModeSliderProps from './types';

const backgroundColorStart = styles.colorOctantGrey12;
const backgroundColorEnd = styles.colorOctantGreen_80;

const labelOpacityStart = 1;
const labelOpacityEnd = 0;

const buttonBackgroundColorStart = styles.colorWhite;
const buttonBackgroundColorEnd = styles.colorOctantGreen;

const buttonArrowColorStart = styles.colorOctantDark;
const buttonArrowColorEnd = styles.colorWhite;

const SettingsPatronModeSlider: FC<SettingsPatronModeSliderProps> = ({
  onPatronModeStatusChange,
}) => {
  const dataTest = 'PatronModeSlider';
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: isPatronMode } = useIsPatronMode();
  const [isPatronModeEnabled] = useState(isPatronMode);
  const { t } = useTranslation('translation', { keyPrefix: 'components.settings.patronMode' });
  const { isDesktop } = useMediaQuery();
  const [ref, animate] = useAnimate();
  const [buttonRef, animateButton] = useAnimate();
  const [isArrowButtonVisible, setIsArrowButtonVisible] = useState(true);

  const patronModeMutation = usePatronMode({
    onSuccess: data => {
      animate(ref.current, { backgroundColor: styles.colorOctantGreen });
      setIsArrowButtonVisible(false);
      queryClient.setQueryData(QUERY_KEYS.patronMode(address!), data);
    },
  });

  const x = useMotionValue(0);
  const [constraints, setConstraints] = useState([0, 0]);
  const [isButtonDragging, setIsButtonDragging] = useState(false);

  const transformInputRange = isPatronModeEnabled ? [...constraints].reverse() : constraints;

  const backgroundColor = useTransform(x, transformInputRange, [
    backgroundColorStart,
    backgroundColorEnd,
  ]);
  const labelOpacity = useTransform(x, transformInputRange, [labelOpacityStart, labelOpacityEnd]);
  const buttonBackgroundColor = useTransform(x, transformInputRange, [
    buttonBackgroundColorStart,
    buttonBackgroundColorEnd,
  ]);
  const buttonArrowColor = useTransform(x, transformInputRange, [
    buttonArrowColorStart,
    buttonArrowColorEnd,
  ]);

  useEffect(() => {
    if (!ref.current || !buttonRef.current) {
      return;
    }
    const containerWidth = ref.current.getBoundingClientRect().width;
    const arrowButtonWidth = buttonRef.current.getBoundingClientRect().width;

    const containerComputedStyle = getComputedStyle(ref.current);
    const containerPaddingLeft = parseFloat(containerComputedStyle.paddingLeft);
    const containerPaddingRight = parseFloat(containerComputedStyle.paddingRight);

    const containerHorizontalPadding = containerPaddingLeft + containerPaddingRight;

    const rightConstraint = containerWidth - containerHorizontalPadding - arrowButtonWidth;

    setConstraints([0, rightConstraint]);
    x.set(isPatronModeEnabled ? rightConstraint : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, buttonRef, isDesktop, isPatronModeEnabled]);

  const onConfirm = () => patronModeMutation.mutate('');

  useMotionValueEvent(x, 'change', latest => {
    if (constraints[1] === 0) {
      return;
    }
    if (
      !isButtonDragging &&
      (isPatronModeEnabled ? latest === constraints[0] : latest === constraints[1])
    ) {
      onConfirm();
      return;
    }

    if (latest > constraints[1]) {
      x.set(constraints[1]);
    }

    if (latest < constraints[0]) {
      x.set(constraints[0]);
    }
  });

  return (
    <motion.div ref={ref} className={styles.root} data-test={dataTest} style={{ backgroundColor }}>
      <AnimatePresence>
        {isArrowButtonVisible && (
          <motion.div
            key="arrow-button"
            ref={buttonRef}
            className={styles.button}
            data-test={`${dataTest}__button`}
            drag="x"
            dragConstraints={{ left: constraints[0], right: constraints[1] }}
            dragElastic={false}
            dragMomentum={false}
            exit={{ opacity: 0 }}
            onDragEnd={() => {
              if (constraints[1] === 0) {
                return;
              }

              const xPosition = x.get();
              setIsButtonDragging(false);
              if (
                isPatronModeEnabled ? xPosition === constraints[0] : xPosition === constraints[1]
              ) {
                onConfirm();
                return;
              }

              const shouldAnimateButtonToTheLeftEdge = isPatronMode
                ? xPosition < constraints[1] / 2
                : xPosition <= constraints[1] / 2;

              animateButton(
                buttonRef.current,
                { x: shouldAnimateButtonToTheLeftEdge ? constraints[0] : constraints[1] },
                {
                  bounce: 0,
                  bounceDamping: 0,
                  bounceStiffness: 0,
                  stiffness: 0,
                },
              );
            }}
            onDragStart={() => setIsButtonDragging(true)}
            style={{
              backgroundColor: buttonBackgroundColor,
              x,
            }}
          >
            <svg
              className={cx(
                styles.arrowRightSvg,
                isPatronModeEnabled && styles.isPatronModeEnabled,
              )}
              data-test={`${dataTest}__button__arrow`}
            >
              <motion.path
                d="m7.99 13.253-1.278-1.264 4.439-4.44H0V5.704h11.15L6.713 1.271 7.99 0l6.627 6.627-6.627 6.626Z"
                data-test={`${dataTest}__button__arrow__path`}
                style={{ fill: buttonArrowColor }}
              />
            </svg>
          </motion.div>
        )}
        {isArrowButtonVisible ? (
          <motion.div
            key="slider-info-label"
            className={styles.label}
            data-test={`${dataTest}__label`}
            style={{ opacity: labelOpacity }}
          >
            {isPatronModeEnabled ? t('slideLeftToConfirm') : t('slideRightToConfirm')}
          </motion.div>
        ) : (
          <motion.div
            key="patron-mode-status-label"
            animate={{ opacity: 1 }}
            className={styles.patronModeLabel}
            data-test={`${dataTest}__status-label`}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeIn' }}
          >
            {isPatronModeEnabled ? t('patronModeDisabled') : t('patronModeEnabled')}
            <motion.svg
              animate={{ scale: [0, 0, 0, 0, 1.5, 1, 1, 1, 1, 1] }}
              className={styles.tickSvg}
              onAnimationComplete={() => onPatronModeStatusChange()}
              transition={{ duration: 1, ease: 'easeIn' }}
            >
              <path
                d="m1.407 6.664 2.938 3.752 8.485-8.485"
                fill="transparent"
                stroke={styles.colorWhite}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPatronModeSlider;
