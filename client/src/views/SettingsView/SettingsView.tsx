import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Header from 'components/core/Header/Header';
import InputCheckbox from 'components/core/InputCheckbox/InputCheckbox';
import InputSelect from 'components/core/InputSelect/InputSelect';
import InputText from 'components/core/InputText/InputText';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './style.module.scss';

const options = [
  { label: 'USD', value: 'USD' },
  { label: 'AUD', value: 'AUD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
  { label: 'CNY', value: 'CNY' },
  { label: 'GBP', value: 'GBP' },
];

const SettingsView = (): ReactElement => {
  return (
    <MainLayoutContainer>
      <Header text="Settings" />
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        Choose a display currency
        <InputSelect isDisabled options={options} selectedOption={options[0]} />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
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
        Use ETH as main value display
        <InputCheckbox isDisabled />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        Show Metrics introductions
        <InputCheckbox isDisabled />
      </BoxRounded>
      <BoxRounded className={styles.box} justifyContent="spaceBetween">
        Always show Allocate onboarding
        <InputCheckbox isDisabled />
      </BoxRounded>
    </MainLayoutContainer>
  );
};

export default SettingsView;
