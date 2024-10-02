import React, { FC, Fragment } from 'react';
import { Trans } from 'react-i18next';

import TransactionsListItem from 'components/Home/HomeGridTransactions/TransactionsListItem';
import Img from 'components/ui/Img';

import styles from './TransactionsList.module.scss';
import TransactionsListProps from './types';

const TransactionsList: FC<TransactionsListProps> = ({ history }) => {
  if (!history?.length) {
    return (
      <div>
        <Img alt="swept" className={styles.image} src="/images/swept.webp" />
        <div className={styles.info}>
          <Trans i18nKey="components.home.homeGridTransactions.transactionsList.empty" />
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {history.map(element => (
        <TransactionsListItem key={`${element.type}_${element.timestamp}`} {...element} />
      ))}
    </Fragment>
  );
};

export default TransactionsList;
