import React, { FC, Fragment, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import { getValuesToDisplay } from 'components/core/DoubleValue/utils';
import HistoryItemDetailsModal from 'components/dedicated/History/HistoryItemDetailsModal/HistoryItemDetailsModal';
import HistoryTransactionLabel from 'components/dedicated/History/HistoryTransactionLabel/HistoryTransactionLabel';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import { HistoryItemProps } from 'hooks/queries/useHistory';
import useSettingsStore from 'store/settings/store';

import styles from './HistoryItem.module.scss';

const HistoryItem: FC<HistoryItemProps> = props => {
  const { type, amount, projectsNumber } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'components.dedicated.historyItem' });
  const {
    data: { displayCurrency, isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      displayCurrency: data.displayCurrency,
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));
  const { data: cryptoValues, error } = useCryptoValues(displayCurrency);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const title = useMemo(() => {
    switch (type) {
      case 'allocation':
        return t('allocatedFunds');
      case 'lock':
        return t('lockedGLM');
      case 'unlock':
        return t('unlockedGLM');
      default:
        return t('withdrawnFunds');
    }
  }, [t, type]);

  const values = getValuesToDisplay({
    cryptoCurrency: ['allocation', 'withdrawal'].includes(type) ? 'ethereum' : 'golem',
    cryptoValues,
    displayCurrency: displayCurrency!,
    error,
    isCryptoMainValueDisplay,
    valueCrypto: amount,
  });

  return (
    <Fragment>
      <BoxRounded className={styles.box} hasPadding={false} onClick={() => setIsModalOpen(true)}>
        <div className={styles.titleAndSubtitle}>
          <div className={styles.title}>{title}</div>
          {!!projectsNumber && (
            <div className={styles.subtitle}>
              {projectsNumber} {t('projects')}
            </div>
          )}
          <HistoryTransactionLabel type="confirmed" />
        </div>
        <div className={styles.values}>
          <div className={styles.primary}>{values.primary}</div>
          <div className={styles.secondary}>{values.secondary}</div>
        </div>
      </BoxRounded>
      <HistoryItemDetailsModal
        {...props}
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default memo(HistoryItem);
