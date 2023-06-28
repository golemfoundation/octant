import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import React, { FC } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { cross } from 'svg/misc';

import styles from './Modal.module.scss';
import ModalProps from './types';

const variantsCenter = {
  showHide: isDesktop => ({
    bottom: 'calc(50% + 20px)',
    margin: isDesktop ? '0' : '0 2.4rem',
    opacity: 0,
    x: isDesktop ? '-50%' : '0',
    y: `50%`,
  }),
  visible: isDesktop => ({
    bottom: '50%',
    margin: isDesktop ? '0' : '0 2.4rem',
    opacity: 1,
    x: isDesktop ? '-50%' : '0',
    y: '50%',
  }),
};

const variantsBottom = {
  showHide: {
    bottom: '-100%',
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
}) => {
  const { isDesktop } = useMediaQuery();

  return (
    <AnimatePresence>
      {isOverflowEnabled && isOpen && (
        <motion.div
          key="modal-overflow"
          animate={{
            opacity: 1,
          }}
          className={cx(styles.overflow, isOpen && styles.isOpen)}
          data-test={`${dataTest}__overflow`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClosePanel}
        />
      )}
      {isOpen && (
        <motion.div
          key="modal-root"
          animate="visible"
          className={cx(styles.root, className, styles[`variant--${variant}`])}
          custom={isDesktop}
          data-test={dataTest}
          exit="showHide"
          initial="showHide"
          onAnimationComplete={definition => {
            if (definition !== 'showHide' || !onModalClosed) {
              return;
            }
            onModalClosed();
          }}
          transition={{ damping: 0.5 }}
          variants={isDesktop || variant === 'small' ? variantsCenter : variantsBottom}
        >
          {Image && Image}
          <div className={cx(styles.body, Image && styles.hasImage, bodyClassName)}>
            <AnimatePresence initial={false}>
              {header && (
                <motion.div
                  animate={{ height: 'auto', marginBottom: '4rem', opacity: 1 }}
                  className={styles.header}
                  exit={{ height: 0, marginBottom: 0, opacity: 0 }}
                  initial={{ height: 0, marginBottom: 0, opacity: 0 }}
                  transition={{ ease: 'linear' }}
                >
                  {header}
                </motion.div>
              )}
            </AnimatePresence>
            {children}
          </div>
          <Button
            className={cx(styles.buttonClose, isFullScreen && styles.isFullScreen)}
            dataTest={`${dataTest}__Button`}
            Icon={<Svg img={cross} size={1} />}
            onClick={onClosePanel}
            variant="iconOnly"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
