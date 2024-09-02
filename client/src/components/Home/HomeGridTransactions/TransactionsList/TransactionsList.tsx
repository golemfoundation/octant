import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionsListItem from 'components/Home/HomeGridTransactions/TransactionsListItem';

import styles from './TransactionsList.module.scss';
import TransactionsListProps from './types';

const TransactionsList: FC<TransactionsListProps> = ({ history }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions.transactionsList',
  });

  if (!history?.length) {
    return <div className={styles.emptyHistoryInfo}>{t('emptyHistory')}</div>;
  }

  return (
    <Fragment>
      {history.map((element, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <TransactionsListItem key={index} {...element} />
      ))}
    </Fragment>
  );
};

export default TransactionsList;
