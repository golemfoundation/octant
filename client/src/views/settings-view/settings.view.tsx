import React, { ReactElement } from 'react';

import BoxRounded from 'components/core/box-rounded/box-rounded.component';
import Header from 'components/core/header/header.component';
import InputCheckbox from 'components/core/input-checkbox/input-checkbox.component';
import InputSelect from 'components/core/input-select/input-select.component';
import InputText from 'components/core/input-text/input-text.component';
import MainLayout from 'layouts/main-layout/main.layout';

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
    <MainLayout>
      <Header text="Settings" />
      <BoxRounded className={styles.box}>
        Choose a display currency
        <InputSelect options={options} selectedOption={options[0]} />
      </BoxRounded>
      <InputText
        className={styles.box}
        label="Allocate value adjusters default"
        onChange={() => {}}
        suffix="USD"
        value="50.0"
        variant="boxRounded"
      />
      <BoxRounded className={styles.box}>
        Use ETH as main value display
        <InputCheckbox />
      </BoxRounded>
      <BoxRounded className={styles.box}>
        Show Metrics introductions
        <InputCheckbox />
      </BoxRounded>
      <BoxRounded className={styles.box}>
        Always show Allocate onboarding
        <InputCheckbox />
      </BoxRounded>
    </MainLayout>
  );
};

export default SettingsView;
