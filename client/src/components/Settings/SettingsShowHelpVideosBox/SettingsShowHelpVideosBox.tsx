import React, { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';

import SettingsToggleBox from 'components/Settings/SettingsToggleBox';
import useSettingsStore from 'store/settings/store';

const SettingsShowHelpVideosBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { showHelpVideos, setShowHelpVideos } = useSettingsStore(state => ({
    setShowHelpVideos: state.setShowHelpVideos,
    showHelpVideos: state.data.showHelpVideos,
  }));

  return (
    <SettingsToggleBox
      dataTest="SettingsShowHelpVideosBox"
      isChecked={showHelpVideos}
      onChange={({ target: { checked: isChecked } }) => setShowHelpVideos(isChecked)}
    >
      {t('showHelpVideos')}
    </SettingsToggleBox>
  );
};

export default memo(SettingsShowHelpVideosBox);
