import React, { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import { getValuesToDisplay } from 'components/core/DoubleValue/utils';
import Svg from 'components/core/Svg/Svg';
import useCryptoValues from 'hooks/queries/useCryptoValues';
import { HistoryItemProps } from 'hooks/queries/useHistory';
import useSettingsStore from 'store/settings/store';
import { allocate, donation } from 'svg/history';

import styles from './HistoryItem.module.scss';

const HistoryItem: FC<HistoryItemProps> = ({ type, amount, projectsNumber }) => {
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

  const img = ['allocation', 'withdrawal'].includes(type) ? allocate : donation;

  return (
    <BoxRounded className={styles.box} hasPadding={false}>
      <div className={styles.iconAndTitle}>
        <Svg img={img} size={4} />
        <div className={styles.titleAndSubtitle}>
          <div className={styles.title}>{title}</div>
          {!!projectsNumber && (
            <div className={styles.subtitle}>
              {projectsNumber} {t('projects')}
            </div>
          )}
        </div>
      </div>
      <div className={styles.values}>
        <div className={styles.primary}>{values.primary}</div>
        <div className={styles.secondary}>{values.secondary}</div>
      </div>
    </BoxRounded>
  );
};

export default memo(HistoryItem);
