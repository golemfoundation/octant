import cx from 'classnames';
import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Header from 'components/core/Header/Header';
import InputCheckbox from 'components/core/InputCheckbox/InputCheckbox';
import InputSelect from 'components/core/InputSelect/InputSelect';
import InputText from 'components/core/InputText/InputText';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useSettingsStore from 'store/settings/store';
import { SettingsData } from 'store/settings/types';

import styles from './SettingsView.module.scss';

const options = [
  { label: 'USD', value: 'usd' },
  { label: 'AUD', value: 'aud' },
  { label: 'EUR', value: 'eur' },
  { label: 'JPY', value: 'jpy' },
  { label: 'CNY', value: 'cny' },
  { label: 'GBP', value: 'gbp' },
];

const SettingsView = (): ReactElement => {
  const {
    setDisplayCurrency,
    setIsAllocateOnboardingAlwaysVisible,
    setIsCryptoMainValueDisplay,
    data: { displayCurrency, isAllocateOnboardingAlwaysVisible, isCryptoMainValueDisplay },
  } = useSettingsStore();
  return (
    <MainLayout>
      <Header text="Settings" />
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        Choose a display currency
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
          label="Allocate value adjusters default"
          onChange={() => {}}
          suffix="USD"
          value="50.0"
          variant="boxRounded"
        />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        Use crypto as main value display
        <InputCheckbox
          isChecked={isCryptoMainValueDisplay}
          onChange={({ target: { checked: isChecked } }) => setIsCryptoMainValueDisplay(isChecked)}
        />
      </BoxRounded>
      <BoxRounded className={cx(styles.box, styles.isDisabled)} justifyContent="spaceBetween">
        Show Metrics introductions
        <InputCheckbox isDisabled />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        Always show Allocate onboarding
        <InputCheckbox
          isChecked={isAllocateOnboardingAlwaysVisible}
          onChange={event => setIsAllocateOnboardingAlwaysVisible(event.target.checked)}
        />
      </BoxRounded>
    </MainLayout>
  );
};

export default SettingsView;
