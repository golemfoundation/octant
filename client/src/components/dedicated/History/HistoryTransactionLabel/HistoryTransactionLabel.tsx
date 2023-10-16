import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './HistoryTransactionLabel.module.scss';
import HistoryTransactionLabelProps from './types';

const HistoryTransactionLabel: FC<HistoryTransactionLabelProps> = ({ isFinalized }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyTransactionLabel',
  });
  return (
    <div className={cx(styles.root, isFinalized && styles.isFinalized)}>
      {isFinalized ? t('confirmed') : t('pending')}
    </div>
  );
};

export default HistoryTransactionLabel;
