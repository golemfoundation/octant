import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import Loader from 'components/core/Loader/Loader';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useHistory from 'hooks/queries/useHistory';

import styles from './History.module.scss';
import HistoryItem from './HistoryItem/HistoryItem';

const History = (): ReactElement => {
  const { i18n } = useTranslation('translation');
  const { isConnected } = useAccount();
  const { data: history, isFetching: isFetchingHistory } = useHistory();
  const { timeCurrentEpochStart } = useEpochAndAllocationTimestamps();

  const shouldHistoryBeVisible = isConnected;
  const isListAvailable = shouldHistoryBeVisible && history !== undefined;
  const showLoader = !isListAvailable || isFetchingHistory || timeCurrentEpochStart === undefined;

  return (
    <div className={styles.root} data-test="History">
      <div className={styles.header}>{i18n.t('common.history')}</div>
      {shouldHistoryBeVisible &&
        (showLoader ? (
          <Loader className={styles.loader} />
        ) : (
          history?.map((element, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <HistoryItem key={index} {...element} timeCurrentEpochStart={timeCurrentEpochStart} />
          ))
        ))}
    </div>
  );
};

export default History;
