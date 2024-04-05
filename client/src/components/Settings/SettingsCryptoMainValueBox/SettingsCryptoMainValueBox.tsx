import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsToggleBox from 'components/Settings/SettingsToggleBox';
import useSettingsStore from 'store/settings/store';

const SettingsCryptoMainValueBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { setIsCryptoMainValueDisplay, isCryptoMainValueDisplay } = useSettingsStore(state => ({
    isCryptoMainValueDisplay: state.data.isCryptoMainValueDisplay,
    setIsCryptoMainValueDisplay: state.setIsCryptoMainValueDisplay,
  }));

  return (
    <SettingsToggleBox
      dataTest="SettingsCryptoMainValueBox"
      isChecked={isCryptoMainValueDisplay}
      onChange={({ target: { checked: isChecked } }) => setIsCryptoMainValueDisplay(isChecked)}
    >
      {t('cryptoMainValueDisplay')}
    </SettingsToggleBox>
  );
};

export default memo(SettingsCryptoMainValueBox);
