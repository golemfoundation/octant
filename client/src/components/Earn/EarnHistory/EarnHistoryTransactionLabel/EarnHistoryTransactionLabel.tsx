import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './EarnHistoryTransactionLabel.module.scss';
import EarnHistoryTransactionLabelProps from './types';

const EarnHistoryTransactionLabel: FC<EarnHistoryTransactionLabelProps> = ({ isFinalized }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.historyTransactionLabel',
  });
  return (
    <div className={cx(styles.root, isFinalized && styles.isFinalized)}>
      {isFinalized ? t('confirmed') : t('pending')}
    </div>
  );
};

export default EarnHistoryTransactionLabel;
