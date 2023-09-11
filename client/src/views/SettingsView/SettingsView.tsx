import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import InputSelect from 'components/core/InputSelect/InputSelect';
import InputToggle from 'components/core/InputToggle/InputToggle';
import Svg from 'components/core/Svg/Svg';
import { TERMS_OF_USE } from 'constants/urls';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useSettingsStore from 'store/settings/store';
import { SettingsData } from 'store/settings/types';
import { octantWordmark } from 'svg/logo';

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
  const { isDesktop } = useMediaQuery();
  const { data: currentEpoch } = useCurrentEpoch();
  const {
    setDisplayCurrency,
    setIsAllocateOnboardingAlwaysVisible,
    setIsCryptoMainValueDisplay,
    setAreOctantTipsAlwaysVisible,
    displayCurrency,
    isAllocateOnboardingAlwaysVisible,
    isCryptoMainValueDisplay,
    areOctantTipsAlwaysVisible,
  } = useSettingsStore(state => ({
    areOctantTipsAlwaysVisible: state.data.areOctantTipsAlwaysVisible,
    displayCurrency: state.data.displayCurrency,
    isAllocateOnboardingAlwaysVisible: state.data.isAllocateOnboardingAlwaysVisible,
    isCryptoMainValueDisplay: state.data.isCryptoMainValueDisplay,
    setAreOctantTipsAlwaysVisible: state.setAreOctantTipsAlwaysVisible,
    setDisplayCurrency: state.setDisplayCurrency,
    setIsAllocateOnboardingAlwaysVisible: state.setIsAllocateOnboardingAlwaysVisible,
    setIsCryptoMainValueDisplay: state.setIsCryptoMainValueDisplay,
  }));

  return (
    <MainLayout dataTest="SettingsView">
      <BoxRounded
        alignment="left"
        className={styles.infoBox}
        hasPadding={false}
        isVertical
        textAlign="left"
      >
        <Svg
          classNameSvg={styles.infoTitle}
          img={octantWordmark}
          size={isDesktop ? [11.2, 2.7] : [8.4, 2]}
        />
        <div className={styles.infoEpoch}>{t('epoch', { epoch: currentEpoch })}</div>
        <div className={styles.infoContainer}>
          <div className={styles.info}>{t('golemFoundationProject')}</div>
          <div className={styles.info}>{t('poweredByCoinGeckoApi')}</div>
          <Button className={styles.link} href={TERMS_OF_USE} variant="link3">
            {t('termsAndConditions')}
          </Button>
        </div>
      </BoxRounded>
      <BoxRounded
        className={styles.box}
        hasPadding={false}
        justifyContent="spaceBetween"
        textAlign="left"
      >
        {t('cryptoMainValueDisplay')}
        <InputToggle
          className={styles.inputToggle}
          dataTest="InputToggle__UseCryptoAsMainValueDisplay"
          isChecked={isCryptoMainValueDisplay}
          onChange={({ target: { checked: isChecked } }) => setIsCryptoMainValueDisplay(isChecked)}
        />
      </BoxRounded>
      <BoxRounded
        className={styles.box}
        hasPadding={false}
        justifyContent="spaceBetween"
        textAlign="left"
      >
        {t('chooseDisplayCurrency')}
        <div className={styles.currencySelectorWrapper}>
          <div className={styles.spacer} />
          <InputSelect
            onChange={option =>
              setDisplayCurrency(option!.value as SettingsData['displayCurrency'])
            }
            options={options}
            selectedOption={options.find(({ value }) => value === displayCurrency)}
          />
        </div>
      </BoxRounded>
      <BoxRounded
        className={styles.box}
        hasPadding={false}
        justifyContent="spaceBetween"
        textAlign="left"
      >
        {t('alwaysShowOnboarding')}
        <InputToggle
          className={styles.inputToggle}
          dataTest="InputToggle__AlwaysShowOnboarding"
          isChecked={isAllocateOnboardingAlwaysVisible}
          onChange={event => setIsAllocateOnboardingAlwaysVisible(event.target.checked)}
        />
      </BoxRounded>
      <BoxRounded className={styles.box} hasPadding={false} justifyContent="spaceBetween">
        {t('alwaysShowOctantTips')}
        <InputToggle
          dataTest="AlwaysShowOctantTips__InputCheckbox"
          isChecked={areOctantTipsAlwaysVisible}
          onChange={event => setAreOctantTipsAlwaysVisible(event.target.checked)}
        />
      </BoxRounded>
    </MainLayout>
  );
};

export default SettingsView;
