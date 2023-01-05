import React, { FC } from 'react';
import cx from 'classnames';

import { notificationIcon } from 'svg/misc';
import Svg from 'components/core/Svg/Svg';

import ToastProps from './types';
import styles from './toast.module.scss';

import './Toast.scss';

const Toast: FC<ToastProps> = ({ title, message, type = 'info' }) => (
  <div className={cx(styles.root, styles[`type--${type}`])}>
    <Svg classNameSvg={styles.icon} img={notificationIcon} size={2.4} />
    <div className={styles.body}>
      {title && <div className={styles.title}>{title}</div>}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  </div>
);

export default Toast;
