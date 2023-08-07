/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, useEffect, useState } from 'react';

import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './Tooltip.module.scss';
import TooltipProps from './types';

const Tooltip: FC<TooltipProps> = ({ wrapperClassname, children, text, showForce }) => {
  const { isDesktop } = useMediaQuery();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!showForce);
  }, [showForce]);

  return (
    <div
      className={wrapperClassname}
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
      <AnimatePresence>
        {(isVisible || showForce) && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.tooltip}
            exit={{ opacity: 0, y: 8 }}
            initial={{ opacity: 0, y: 8 }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

export default Tooltip;
