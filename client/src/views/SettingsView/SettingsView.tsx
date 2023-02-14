import cx from 'classnames';
import React, { FC } from 'react';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Header from 'components/core/Header/Header';
import InputCheckbox from 'components/core/InputCheckbox/InputCheckbox';
import InputSelect from 'components/core/InputSelect/InputSelect';
import InputText from 'components/core/InputText/InputText';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './style.module.scss';
import SettingsViewProps from './types';

const options = [
  { label: 'USD', value: 'USD' },
  { label: 'AUD', value: 'AUD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' },
  { label: 'CNY', value: 'CNY' },
  { label: 'GBP', value: 'GBP' },
];

const SettingsView: FC<SettingsViewProps> = ({
  isAllocateOnboardingAlwaysVisible,
  setIsAllocateOnboardingAlwaysVisible,
}) => (
  <MainLayoutContainer>
    <Header text="Settings" />
    <BoxRounded className={cx(styles.box, styles.isDisabled)} justifyContent="spaceBetween">
      Choose a display currency
      <InputSelect isDisabled options={options} selectedOption={options[0]} />
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
    <BoxRounded className={cx(styles.box, styles.isDisabled)} justifyContent="spaceBetween">
      Use ETH as main value display
      <InputCheckbox isDisabled />
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
  </MainLayoutContainer>
);

export default SettingsView;
