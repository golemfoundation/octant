import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC } from 'react';

import styles from './Loader.module.scss';
import LoaderProps from './types';

const Loader: FC<LoaderProps> = ({
  className,
  dataTest = 'Loader',
  variant = 'normal',
  color = 'green',
}) => {
  const cxcy = variant === 'normal' ? 16 : 8;
  const r = variant === 'normal' ? 10.5 : 7;

  return (
    <motion.svg
      key={`loader-${variant}-${color}`}
      className={cx(
        styles.root,
        styles[`variant--${variant}`],
        styles[`color--${color}`],
        className,
      )}
      data-test={dataTest}
      viewBox={`0 0 ${variant === 'normal' ? 32 : 16} ${variant === 'normal' ? 32 : 16}`}
    >
      <circle className={styles.circleLoaderBackground} cx={cxcy} cy={cxcy} r={r} />
      <motion.circle
        key={`loader-${variant}-${color}__circle`}
        animate={{ pathLength: 0.8, rotate: 360 }}
        className={styles.circleLoader}
        cx={cxcy}
        cy={cxcy}
        r={r}
        transition={{
          duration: 0.8,
          ease: 'linear',
          repeat: Infinity,
        }}
      />
    </motion.svg>
  );
};

export default Loader;
