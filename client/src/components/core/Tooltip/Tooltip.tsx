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
}) => {
  const { isDesktop } = useMediaQuery();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!showForce);
  }, [showForce]);

  const onClick = async () => {
    if (onClickCallback) {
      const shouldSetIsVisible = await onClickCallback();

      if (shouldSetIsVisible) {
        setIsVisible(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 1000);
      }
      return;
    }

    if (!isDesktop && shouldShowOnClickMobile) {
      setIsVisible(_isVisible => !_isVisible);
    }
  };

  const isTooltipVisible = isVisible || !!showForce;

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
          setIsVisible(false);
        }}
        onMouseOver={() => {
          if (!isDesktop) {
            return;
          }
          setIsVisible(true);
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
