import React, { FC } from 'react';

import Svg from 'components/core/Svg/Svg';
import { SvgImageConfig } from 'components/core/Svg/types';
import { notificationIconSuccess, notificationIconWarning } from 'svg/misc';

import styles from './Toast.module.scss';
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

const Toast: FC<ToastProps> = ({ dataTest, title, message, type = 'info' }) => (
  <div className={styles.root} data-test={dataTest}>
    <Svg classNameSvg={styles.icon} img={getIcon(type)} size={3.2} />
    <div className={styles.body}>
      {title && (
        <div className={styles.title} data-test={`${dataTest}__title`}>
          {title}
        </div>
      )}
      {message && <div className={styles.message}>{message}</div>}
    </div>
  </div>
);

export default Toast;
