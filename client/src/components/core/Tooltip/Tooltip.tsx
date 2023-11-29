/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';

import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './Tooltip.module.scss';
import TooltipProps from './types';

const Tooltip: FC<TooltipProps> = ({
  children,
  childrenClassName,
  dataTest,
  onClickCallback,
  position = 'top',
  shouldShowOnClickMobile = true,
  showForce,
  text,
  className,
  variant = 'normal',
  tooltipClassName,
  tooltipWrapperClassName,
  isDisabled = false,
  hideAfterClick,
  onVisibilityChange,
  showDelay,
}) => {
  const { isDesktop } = useMediaQuery();
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [delayTimerId, setDelayTimerId] = useState<NodeJS.Timeout | undefined>();

  const clearDelayTimer = () => {
    clearTimeout(delayTimerId);
    setDelayTimerId(undefined);
  };

  const onClick = async () => {
    if (delayTimerId) {
      clearDelayTimer();
    }

    if (onClickCallback) {
      onClickCallback();
    }

    if (hideAfterClick) {
      setIsClicked(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return;
    }

    if (!isDesktop && shouldShowOnClickMobile) {
      setIsVisible(_isVisible => !_isVisible);
    }
  };

  useEffect(() => {
    if (!onVisibilityChange) {
      return;
    }
    onVisibilityChange(isVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    setIsVisible(!!showForce);
  }, [showForce]);

  const isTooltipVisible = isVisible || !!showForce;

  if (isDisabled) {
    return children;
  }

  return (
    <div className={cx(styles.root, styles[`position--${position}`], className)}>
      <div
        className={cx(styles.children, isVisible && styles.isVisible, childrenClassName)}
        data-test={dataTest}
        onClick={onClick}
        onMouseLeave={() => {
          if (!isDesktop) {
            return;
          }
          if (delayTimerId) {
            clearDelayTimer();
          }
          if (hideAfterClick) {
            setIsClicked(false);
          }

          setIsVisible(false);
        }}
        onMouseOver={() => {
          if (!isDesktop || (hideAfterClick && isClicked)) {
            return;
          }

          if (!showDelay) {
            setIsVisible(true);
            return;
          }

          if (showDelay && !delayTimerId) {
            const timerId = setTimeout(() => setIsVisible(true), showDelay);
            setDelayTimerId(timerId);
          }
        }}
      >
        {children}
      </div>
      {isTooltipVisible && !isDesktop && (
        <div className={styles.overlay} onClick={() => setIsVisible(false)} />
      )}
      <div
        className={cx(
          styles.tooltipWrapper,
          styles[`position--${position}`],
          tooltipWrapperClassName,
        )}
      >
        <AnimatePresence>
          {isTooltipVisible && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={cx(
                styles.tooltip,
                styles[`position--${position}`],
                styles[`variant--${variant}`],
                tooltipClassName,
              )}
              data-test={`${dataTest}__content`}
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, x: position === 'top' ? '-50%' : '0%', y: 8 }}
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tooltip;
