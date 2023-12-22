import React, { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import EarnHistoryItem from 'components/Earn/EarnHistory/EarnHistoryItem';

import styles from './EarnHistoryList.module.scss';
import EarnHistoryListProps from './types';

const EarnHistoryList: FC<EarnHistoryListProps> = ({ history }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.historyList' });

  if (!history?.length) {
    return <div className={styles.emptyHistoryInfo}>{t('emptyHistory')}</div>;
  }

  return (
    <Fragment>
      {history.map((element, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <EarnHistoryItem key={index} {...element} />
      ))}
    </Fragment>
  );
};

export default EarnHistoryList;
