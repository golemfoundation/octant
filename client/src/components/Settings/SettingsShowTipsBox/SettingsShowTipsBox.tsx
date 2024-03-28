import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsToggleBox from 'components/Settings/SettingsToggleBox';
import useSettingsStore from 'store/settings/store';

const SettingsShowTipsBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { setAreOctantTipsAlwaysVisible, areOctantTipsAlwaysVisible } = useSettingsStore(state => ({
    areOctantTipsAlwaysVisible: state.data.areOctantTipsAlwaysVisible,
    setAreOctantTipsAlwaysVisible: state.setAreOctantTipsAlwaysVisible,
  }));

  return (
    <SettingsToggleBox
      dataTest="SettingsShowTipsBox"
      isChecked={areOctantTipsAlwaysVisible}
      onChange={event => setAreOctantTipsAlwaysVisible(event.target.checked)}
    >
      {t('alwaysShowOctantTips')}
    </SettingsToggleBox>
  );
};

export default SettingsShowTipsBox;
