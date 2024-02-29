import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroller';

import EarnHistoryList from 'components/Earn/EarnHistory/EarnHistoryList';
import EarnHistorySkeleton from 'components/Earn/EarnHistory/EarnHistorySkeleton';
import BoxRounded from 'components/ui/BoxRounded';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './EarnHistory.module.scss';
import EarnHistoryProps from './types';

const EarnHistory: FC<EarnHistoryProps> = ({ className }) => {
  const { i18n } = useTranslation('translation');
  const { transactionsPending } = useTransactionLocalStore(state => ({
    transactionsPending: state.data.transactionsPending,
  }));

  const { data: currentEpoch } = useCurrentEpoch();
  const { fetchNextPage, history, hasNextPage, isFetching: isFetchingHistory } = useHistory();
  const isProjectAdminMode = useIsProjectAdminMode();

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
      titleClassName={styles.title}
    >
      {showLoader ? (
        <div className={styles.skeleton}>
          <EarnHistorySkeleton />
        </div>
      ) : (
        <InfiniteScroll
          hasMore={hasNextPage}
          initialLoad
          loader={<EarnHistorySkeleton key="history-loader" />}
          loadMore={fetchNextPage}
          pageStart={0}
        >
          <EarnHistoryList history={[...(transactionsPendingSorted || []), ...history]} />
        </InfiniteScroll>
      )}
    </BoxRounded>
  );
};

export default EarnHistory;
