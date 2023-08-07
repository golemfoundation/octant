import cx from 'classnames';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import HistoryItemSkeleton from 'components/dedicated/History//HistoryItemSkeleton/HistoryItemSkeleton';
import HistoryList from 'components/dedicated/History/HistoryList/HistoryList';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useHistory from 'hooks/queries/useHistory';
import useMetaStore from 'store/meta/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './History.module.scss';
import HistoryProps from './types';

const History: FC<HistoryProps> = ({ className }) => {
  const { i18n } = useTranslation('translation');
  const { isAppWaitingForTransactionToBeIndexed } = useMetaStore(state => ({
    isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
  }));

  const { data: currentEpoch } = useCurrentEpoch();
  const { data: history, isFetching: isFetchingHistory } = useHistory();

  const isListAvailable = history !== undefined;
  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const showLoader =
    isAppWaitingForTransactionToBeIndexed ||
    (!isListAvailable && isFetchingHistory && !isPreLaunch);

  return (
    <BoxRounded
      childrenWrapperClassName={styles.childrenWrapper}
      className={cx(styles.root, className)}
      dataTest="History"
      hasPadding={false}
      hasSections
      isVertical
      title={i18n.t('common.history')}
    >
      {showLoader ? <HistoryItemSkeleton /> : <HistoryList history={history} />}
    </BoxRounded>
  );
};

export default History;
