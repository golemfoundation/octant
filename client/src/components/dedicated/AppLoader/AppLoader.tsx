import { motion } from 'framer-motion';
import React, { FC } from 'react';

import Svg from 'components/core/Svg/Svg';
import { octant } from 'svg/logo';

import styles from './AppLoader.module.scss';
import AppLoaderProps from './types';

const AppLoader: FC<AppLoaderProps> = ({ dataTest = 'AppLoader' }) => (
  <div className={styles.root} data-test={dataTest}>
    <Svg classNameSvg={styles.logo} img={octant} size={6.4} />
    <div className={styles.track}>
      <motion.div
        animate={{
          x: ['-95%', '95%', '-95%'],
        }}
        className={styles.loader}
        transition={{
          duration: 1.6,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
    </div>
  </div>
);

export default AppLoader;
