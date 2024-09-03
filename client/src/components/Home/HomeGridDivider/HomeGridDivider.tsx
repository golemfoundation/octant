import React, { memo, ReactNode } from 'react';

import styles from './HomeGridDivider.module.scss';

const HomeGridDivider = (): ReactNode => {
  return <div className={styles.root} />;
};

export default memo(HomeGridDivider);
