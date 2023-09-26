import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import React, { FC, useEffect } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { cross } from 'svg/misc';

import styles from './Modal.module.scss';
import ModalProps from './types';

const variantsCenter = {
  showHide: {
    bottom: 'calc(50% + 20px)',
    opacity: 0,
    y: `50%`,
  },
  visible: {
    bottom: '50%',
    opacity: 1,
    y: '50%',
  },
};

const variantsBottom = {
  showHide: {
    y: '100%',
  },
  visible: {
    bottom: 0,
    opacity: 1,
    x: 0,
    y: 0,
  },
};

const Modal: FC<ModalProps> = ({
  bodyClassName,
  headerClassName,
  variant = 'standard',
  className,
  children,
  dataTest = 'Modal',
  header,
  Image,
  isOpen,
  isOverflowEnabled = true,
  isFullScreen,
  onClosePanel,
  onModalClosed,
  onTouchMove,
  onTouchStart,
  showCloseButton = true,
  isCloseButtonDisabled = false,
  isOverflowOnClickDisabled = false,
  overflowClassName,
}) => {
  const { isDesktop } = useMediaQuery();

  const onOverflowClick = () => {
    if (isOverflowOnClickDisabled) {
      return;
    }
    onClosePanel();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return;
    }

    document.body.style.overflow = 'scroll';
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOverflowEnabled && isOpen && (
        <motion.div
          key="modal-overflow"
          animate={{
            opacity: 1,
          }}
          className={cx(
            styles.overflow,
            isOpen && styles.isOpen,
            isOverflowOnClickDisabled && styles.isOverflowOnClickDisabled,
            overflowClassName,
          )}
          data-test={`${dataTest}__overflow`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onOverflowClick}
        />
      )}
      {isOpen && (
        <motion.div
          key="modal-root"
          animate="visible"
          className={cx(styles.root, className, styles[`variant--${variant}`])}
          data-test={dataTest}
          exit="showHide"
          initial="showHide"
          onAnimationComplete={definition => {
            if (definition !== 'showHide' || !onModalClosed) {
              return;
            }
            onModalClosed();
          }}
          onTouchMove={onTouchMove}
          onTouchStart={onTouchStart}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          variants={isDesktop || variant === 'small' ? variantsCenter : variantsBottom}
        >
          {Image && Image}
          <div className={cx(styles.body, Image && styles.hasImage, bodyClassName)}>
            <AnimatePresence initial={false}>
              {header && (
                <motion.div
                  animate={{ height: 'auto', opacity: 1 }}
                  className={cx(styles.header, headerClassName)}
                  exit={{ height: 0, opacity: 0 }}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ ease: 'linear' }}
                >
                  {header}
                </motion.div>
              )}
            </AnimatePresence>
            {children}
          </div>
          {showCloseButton && (
            <Button
              className={cx(
                styles.buttonClose,
                isFullScreen && styles.isFullScreen,
                isCloseButtonDisabled && styles.isCloseButtonDisabled,
              )}
              dataTest={`${dataTest}__Button`}
              Icon={<Svg img={cross} size={1} />}
              onClick={onClosePanel}
              variant="iconOnly"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
