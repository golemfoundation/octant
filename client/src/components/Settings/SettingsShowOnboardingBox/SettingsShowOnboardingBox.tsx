import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsToggleBox from 'components/Settings/SettingsToggleBox';
import useSettingsStore from 'store/settings/store';

const SettingsShowOnboardingBox = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { setIsAllocateOnboardingAlwaysVisible, isAllocateOnboardingAlwaysVisible } =
    useSettingsStore(state => ({
      isAllocateOnboardingAlwaysVisible: state.data.isAllocateOnboardingAlwaysVisible,
      setIsAllocateOnboardingAlwaysVisible: state.setIsAllocateOnboardingAlwaysVisible,
    }));

  return (
    <SettingsToggleBox
      dataTest="SettingsShowOnboardingBox"
      isChecked={isAllocateOnboardingAlwaysVisible}
      onChange={event => setIsAllocateOnboardingAlwaysVisible(event.target.checked)}
    >
      {t('alwaysShowOnboarding')}
    </SettingsToggleBox>
  );
};

export default SettingsShowOnboardingBox;
