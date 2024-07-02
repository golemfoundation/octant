import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import React, { FC, useEffect } from 'react';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { cross } from 'svg/misc';
import setDocumentOverflowModal from 'utils/setDocumentOverflowModal';

import styles from './Modal.module.scss';
import ModalProps from './types';

const variantsCenter = {
  showHide: {
    opacity: 0,
    top: 'calc(50% + 20px)',
    y: `-50%`,
  },
  visible: {
    opacity: 1,
    top: '50%',
    y: '-50%',
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

const durationOfTransition = 0.1;

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
  onTouchMove,
  onTouchStart,
  onClick,
  showCloseButton = true,
  isCloseButtonDisabled = false,
  isOverflowOnClickDisabled = false,
  overflowClassName,
  isConnectWalletModal,
}) => {
  const { isDesktop } = useMediaQuery();

  const onOverflowClick = () => {
    if (isOverflowOnClickDisabled) {
      return;
    }
    onClosePanel();
  };

  /**
   * Scrollbar offset is handled in onAnimationComplete.
   * However, in case Modal is unmounted forcibly, here is the cleanup adding scrollbar back.
   */
  useEffect(() => () => setDocumentOverflowModal(false, durationOfTransition * 1000), []);

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
          className={cx(
            styles.root,
            className,
            styles[`variant--${variant}`],
            isConnectWalletModal && styles.isConnectWalletModal,
          )}
          data-test={dataTest}
          exit="showHide"
          initial="showHide"
          onAnimationComplete={definition => {
            if (definition === 'showHide') {
              setDocumentOverflowModal(false, durationOfTransition * 1000);
            }
          }}
          onAnimationStart={definition => {
            if (definition === 'visible') {
              setDocumentOverflowModal(true, durationOfTransition * 1000);
            }
          }}
          onClick={onClick}
          onTouchMove={onTouchMove}
          onTouchStart={onTouchStart}
          transition={{ duration: durationOfTransition, ease: 'easeOut' }}
          variants={isDesktop || variant === 'small' ? variantsCenter : variantsBottom}
        >
          {Image && Image}
          <div className={cx(styles.body, Image && styles.hasImage, bodyClassName)}>
            <AnimatePresence initial={false}>
              {header && (
                <motion.div
                  animate={{ height: 'auto', opacity: 1 }}
                  className={cx(styles.header, headerClassName)}
                  data-test={`${dataTest}__header`}
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
