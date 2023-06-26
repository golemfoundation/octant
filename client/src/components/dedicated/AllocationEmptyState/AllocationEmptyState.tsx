import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Img from 'components/core/Img/Img';

import styles from './AllocationEmptyState.module.scss';

const AllocationEmptyState = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.allocationEmptyState',
  });

  return (
    <div className={styles.root}>
      <Img className={styles.image} src="images/rewards.webp" />
      <div className={styles.text}>{t('text')} </div>
    </div>
  );
};

export default AllocationEmptyState;
