import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import HistoryItemSkeleton from 'components/dedicated/History//HistoryItemSkeleton/HistoryItemSkeleton';
import HistoryList from 'components/dedicated/History/HistoryList/HistoryList';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './History.module.scss';
import HistoryProps from './types';

const History: FC<HistoryProps> = ({ className }) => {
  const { i18n } = useTranslation('translation');
  const { transactionsPending } = useTransactionLocalStore(state => ({
    transactionsPending: state.data.transactionsPending,
  }));

  const { data: currentEpoch } = useCurrentEpoch();
  const { fetchNextPage, history, hasNextPage, isFetching: isFetchingHistory } = useHistory();
  const isProjectAdminMode = useIsProjectAdminMode();

  const onLoadNextHistoryPart = () => {
    fetchNextPage();
  };

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
    <BoxRounded
      childrenWrapperClassName={styles.childrenWrapper}
      className={cx(styles.root, isProjectAdminMode && styles.isProjectAdminMode, className)}
      dataTest="History"
      hasPadding={false}
      hasSections
      isVertical
      title={i18n.t('common.history')}
    >
      {showLoader ? (
        <HistoryItemSkeleton />
      ) : (
        <InfiniteScroll
          hasMore={hasNextPage}
          initialLoad
          loader={<HistoryItemSkeleton key="history-loader" />}
          loadMore={onLoadNextHistoryPart}
          pageStart={0}
        >
          <HistoryList history={[...(transactionsPendingSorted || []), ...history]} />
        </InfiniteScroll>
      )}
    </BoxRounded>
  );
};

export default History;
