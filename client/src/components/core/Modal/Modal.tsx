import cx from 'classnames';
import React, { FC, Fragment, useEffect, useRef } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { IS_INITIAL_LOAD_DONE } from 'constants/dataAttributes';
import { cross } from 'svg/misc';

import styles from './Modal.module.scss';
import ModalProps, { TextProps } from './types';

export const Text: FC<TextProps> = ({ children, className }) => (
  <div className={cx(styles.text, className)}>{children}</div>
);

const Modal: FC<ModalProps> = ({
  bodyClassName,
  className,
  children,
  dataTest = 'Modal',
  header,
  Image,
  isOpen,
  isOverflowEnabled = true,
  isFullScreen,
  onClosePanel,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // TODO: Temporary fix until task https://linear.app/golemfoundation/issue/OCT-470/render-modal-component-only-if-it-should-be-visible is done.
  useEffect(() => {
    setTimeout(() => {
      ref?.current?.setAttribute(IS_INITIAL_LOAD_DONE, 'true');
    }, 100);
  }, []);

  return (
    <Fragment>
      {isOverflowEnabled && (
        <div className={cx(styles.overflow, isOpen && styles.isOpen)} onClick={onClosePanel} />
      )}
      <div ref={ref} className={cx(styles.root, isOpen && styles.isOpen, className)}>
        {Image && <div className={styles.image}>{Image}</div>}
        <div className={cx(styles.body, Image && styles.hasImage, bodyClassName)}>
          {header && <div className={styles.header}>{header}</div>}
          {children}
        </div>
        <Button
          className={cx(styles.buttonClose, isFullScreen && styles.isFullScreen)}
          dataTest={`${dataTest}__Button`}
          Icon={<Svg img={cross} size={1} />}
          onClick={onClosePanel}
          variant="iconOnly"
        />
      </div>
    </Fragment>
  );
};

export default Modal;
