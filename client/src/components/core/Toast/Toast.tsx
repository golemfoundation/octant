import cx from 'classnames';
import React, { FC } from 'react';

import Svg from 'components/core/Svg/Svg';
import { SvgImageConfig } from 'components/core/Svg/types';
import { notificationIconSuccess, notificationIconWarning } from 'svg/misc';

import styles from './toast.module.scss';
import ToastProps from './types';

import './Toast.scss';

const getIcon = (type: ToastProps['type']): SvgImageConfig => {
  switch (type) {
    case 'warning':
    case 'error':
      return notificationIconWarning;
    default:
      return notificationIconSuccess;
  }
};

const Toast: FC<ToastProps> = ({ title, message, type = 'info' }) => (
  <div className={cx(styles.root, styles[`type--${type}`])}>
    <Svg classNameSvg={styles.icon} img={getIcon(type)} size={3.2} />
    <div className={styles.body}>
      {title && <div className={styles.title}>{title}</div>}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  </div>
);

export default Toast;
