import React, { FC, Fragment } from 'react';
import cx from 'classnames';

import { cross } from 'svg/misc';
import Button from 'components/core/button/button.component';
import Svg from 'components/core/svg/svg.component';

import ModalProps from './types';
import styles from './style.module.scss';

const Modal: FC<ModalProps> = ({ className, children, header, isOpen, onClosePanel }) => (
  <Fragment>
    <div className={cx(styles.overflow, isOpen && styles.isOpen)} onClick={onClosePanel} />
    <div className={cx(styles.root, isOpen && styles.isOpen, className)}>
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
