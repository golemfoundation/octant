import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import TransactionsList from 'components/Home/HomeGridTransactions/TransactionsList';
import TransactionsSkeleton from 'components/Home/HomeGridTransactions/TransactionsSkeleton';
import GridTile from 'components/shared/Grid/GridTile';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './HomeGridTransactions.module.scss';
import HomeGridTransactionsProps from './types';

const HomeGridTransactions: FC<HomeGridTransactionsProps> = ({ className }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridTransactions',
  });
  const { transactionsPending } = useTransactionLocalStore(state => ({
    transactionsPending: state.data.transactionsPending,
  }));

  const { data: currentEpoch } = useCurrentEpoch();
  const { fetchNextPage, history, hasNextPage, isFetching: isFetchingHistory } = useHistory();

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const showLoader = isFetchingHistory && !isPreLaunch && !history?.length;

  const transactionsPendingSorted = transactionsPending?.sort(
    ({ timestamp: timestampA }, { timestamp: timestampB }) => {
      if (timestampA < timestampB) {
        return 1;
      }
      if (timestampA > timestampB) {
        return -1;
      }
      return 0;
    },
  );

  return (
    <GridTile className={className} title={t('transactions')}>
      <div className={styles.root}>
        {showLoader ? (
          <div className={styles.skeleton}>
            <TransactionsSkeleton />
          </div>
        ) : (
          <InfiniteScroll
            hasMore={hasNextPage}
            initialLoad
            loader={<TransactionsSkeleton key="history-loader" />}
            loadMore={fetchNextPage}
            pageStart={0}
          >
            <TransactionsList history={[...(transactionsPendingSorted || []), ...history]} />
          </InfiniteScroll>
        )}
      </div>
    </GridTile>
  );
};

export default HomeGridTransactions;
