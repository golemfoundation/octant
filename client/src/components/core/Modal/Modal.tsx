import cx from 'classnames';
import React, { FC, Fragment } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { cross } from 'svg/misc';

import styles from './Modal.module.scss';
import ModalProps from './types';

const Modal: FC<ModalProps> = ({
  className,
  children,
  header,
  isOpen,
  isOverflowEnabled = true,
  onClosePanel,
  onClick,
}) => (
  <Fragment>
    {isOverflowEnabled && (
      <div className={cx(styles.overflow, isOpen && styles.isOpen)} onClick={onClosePanel} />
    )}
    <div
      className={cx(styles.root, isOpen && styles.isOpen, onClick && styles.isClickable, className)}
      onClick={onClick}
    >
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      <Button
        className={styles.buttonClose}
        Icon={<Svg img={cross} size={1} />}
        onClick={onClosePanel}
        variant="iconOnly"
      />
    </div>
  </Fragment>
);

export default Modal;
