import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsToggleBox from 'components/Settings/SettingsToggleBox';
import useSettingsStore from 'store/settings/store';

const SettingsShowQuickTourBox = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { isQuickTourVisible, setIsQuickTourVisible } = useSettingsStore(state => ({
    isQuickTourVisible: state.data.isQuickTourVisible,
    setIsQuickTourVisible: state.setIsQuickTourVisible,
  }));

  return (
    <SettingsToggleBox
      dataTest="SettingsShowQuickTourBox"
      isChecked={isQuickTourVisible}
      onChange={event => setIsQuickTourVisible(event.target.checked)}
    >
      {t('showQuickTour')}
    </SettingsToggleBox>
  );
};

export default SettingsShowQuickTourBox;
