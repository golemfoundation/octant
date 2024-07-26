import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import InputSelect from 'components/ui/InputSelect';
import useSettingsStore from 'store/settings/store';
import { SettingsData } from 'store/settings/types';
import { Options } from 'views/SettingsView/types';

import styles from './SettingsCurrencyBox.module.scss';

const options: Options = [
  { label: 'USD', value: 'usd' },
  { label: 'AUD', value: 'aud' },
  { label: 'EUR', value: 'eur' },
  { label: 'JPY', value: 'jpy' },
  { label: 'CNY', value: 'cny' },
  { label: 'GBP', value: 'gbp' },
];

const SettingsCurrencyBox = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { setDisplayCurrency, displayCurrency } = useSettingsStore(state => ({
    displayCurrency: state.data.displayCurrency,
    setDisplayCurrency: state.setDisplayCurrency,
  }));

  return (
    <BoxRounded
      className={styles.root}
      hasPadding={false}
      justifyContent="spaceBetween"
      textAlign="left"
    >
      {t('chooseDisplayCurrency')}
      <div className={styles.currencySelectorWrapper}>
        <div className={styles.spacer} />
        <InputSelect
          dataTest="SettingsCurrencyBox__InputSelect--currency"
          onChange={option => setDisplayCurrency(option!.value as SettingsData['displayCurrency'])}
          options={options}
          selectedOption={options.find(({ value }) => value === displayCurrency)}
        />
      </div>
    </BoxRounded>
  );
};

export default SettingsCurrencyBox;
