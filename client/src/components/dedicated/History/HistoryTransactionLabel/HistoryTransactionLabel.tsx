import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './HistoryTransactionLabel.module.scss';
import HistoryTransactionLabelProps from './types';

const HistoryTransactionLabel: FC<HistoryTransactionLabelProps> = ({ type }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyTransactionLabel',
  });
  return (
    <div className={cx(styles.root, type === 'pending' && styles.isPending)}>
      {type === 'confirmed' ? t('confirmed') : t('pending')}
    </div>
  );
};

export default HistoryTransactionLabel;
