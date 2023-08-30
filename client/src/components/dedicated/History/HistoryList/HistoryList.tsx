import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import HistoryItem from 'components/dedicated/History/HistoryItem/HistoryItem';

import styles from './HistoryList.module.scss';
import HistoryListProps from './types';

const HistoryList: FC<HistoryListProps> = ({ history }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.historyList' });

  if (!history?.length) {
    return <div className={styles.emptyHistoryInfo}>{t('emptyHistory')}</div>;
  }

  return (
    <Fragment>
      {history.map((element, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <HistoryItem key={index} {...element} />
      ))}
    </Fragment>
  );
};

export default HistoryList;
