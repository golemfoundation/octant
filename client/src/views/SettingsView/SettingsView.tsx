import cx from 'classnames';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Header from 'components/core/Header/Header';
import InputCheckbox from 'components/core/InputCheckbox/InputCheckbox';
import InputSelect from 'components/core/InputSelect/InputSelect';
import InputText from 'components/core/InputText/InputText';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useSettingsStore from 'store/settings/store';
import { SettingsData } from 'store/settings/types';

import styles from './SettingsView.module.scss';
import { Options } from './types';

const options: Options = [
  { label: 'USD', value: 'usd' },
  { label: 'AUD', value: 'aud' },
  { label: 'EUR', value: 'eur' },
  { label: 'JPY', value: 'jpy' },
  { label: 'CNY', value: 'cny' },
  { label: 'GBP', value: 'gbp' },
];

const SettingsView = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const {
    setDisplayCurrency,
    setIsAllocateOnboardingAlwaysVisible,
    setIsCryptoMainValueDisplay,
    allocateValueAdjusterUnit,
    displayCurrency,
    isAllocateOnboardingAlwaysVisible,
    isCryptoMainValueDisplay,
  } = useSettingsStore(state => ({
    allocateValueAdjusterUnit: state.data.allocateValueAdjusterUnit,
    displayCurrency: state.data.displayCurrency,
    isAllocateOnboardingAlwaysVisible: state.data.isAllocateOnboardingAlwaysVisible,
    isCryptoMainValueDisplay: state.data.isCryptoMainValueDisplay,
    setDisplayCurrency: state.setDisplayCurrency,
    setIsAllocateOnboardingAlwaysVisible: state.setIsAllocateOnboardingAlwaysVisible,
    setIsCryptoMainValueDisplay: state.setIsCryptoMainValueDisplay,
  }));
  return (
    <MainLayout dataTest="SettingsView">
      <Header text={t('settings')} />
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        {t('chooseDisplayCurrency')}
        <InputSelect
          onChange={option => setDisplayCurrency(option!.value as SettingsData['displayCurrency'])}
          options={options}
          selectedOption={options.find(({ value }) => value === displayCurrency)}
        />
      </BoxRounded>
      <BoxRounded className={cx(styles.box, styles.isDisabled)} justifyContent="spaceBetween">
        <InputText
          className={styles.box}
          isDisabled
          label={t('allocateValueAdjustersDefault')}
          onChange={() => {}}
          suffix={displayCurrency.toUpperCase()}
          value={allocateValueAdjusterUnit}
          variant="boxRounded"
        />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        {t('cryptoMainValueDisplay')}
        <InputCheckbox
          dataTest="UseCryptoAsMainValueDisplay__InputCheckbox"
          isChecked={isCryptoMainValueDisplay}
          onChange={({ target: { checked: isChecked } }) => setIsCryptoMainValueDisplay(isChecked)}
        />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        {t('alwaysShowOnboarding')}
        <InputCheckbox
          dataTest="AlwaysShowOnboarding__InputCheckbox"
          isChecked={isAllocateOnboardingAlwaysVisible}
          onChange={event => setIsAllocateOnboardingAlwaysVisible(event.target.checked)}
        />
      </BoxRounded>
    </MainLayout>
  );
};

export default SettingsView;
