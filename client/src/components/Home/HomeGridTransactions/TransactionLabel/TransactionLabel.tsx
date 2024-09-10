import cx from 'classnames';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './TransactionLabel.module.scss';
import TransactionLabelProps from './types';

const TransactionLabel: FC<TransactionLabelProps> = ({ isFinalized, isMultisig }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions.transactionLabel',
  });

  const label = useMemo(() => {
    if (isMultisig) {
      return t('pendingMultisig');
    }
    if (isFinalized) {
      return t('confirmed');
    }
    return t('pending');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinalized, isMultisig]);

  return <div className={cx(styles.root, isFinalized && styles.isFinalized)}>{label}</div>;
};

export default TransactionLabel;
