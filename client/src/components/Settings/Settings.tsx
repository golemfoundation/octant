import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import SettingsCryptoMainValueBox from 'components/Settings/SettingsCryptoMainValueBox';
import SettingsCurrencyBox from 'components/Settings/SettingsCurrencyBox';
import SettingsMainInfoBox from 'components/Settings/SettingsMainInfoBox';
import SettingsPatronModeBox from 'components/Settings/SettingsPatronModeBox';
import SettingsShowOnboardingBox from 'components/Settings/SettingsShowOnboardingBox';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './Settings.module.scss';
import SettingsShowHelpVideosBox from './SettingsShowHelpVideosBox';

const Settings = (): ReactElement => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.settings' });
  const { isConnected } = useAccount();

  const { data: isPatronMode } = useIsPatronMode();
  const isProjectAdminMode = useIsProjectAdminMode();

  return (
    <div className={styles.root}>
      <div className={styles.title}>{t('title')}</div>
      <div className={styles.boxesWrapper}>
        {!isProjectAdminMode && (
          <div className={styles.mainInfoBoxWrapper}>
            <SettingsMainInfoBox />
          </div>
        )}
        <SettingsCryptoMainValueBox />
        <SettingsCurrencyBox />
        <SettingsShowHelpVideosBox />
        {isConnected && !isProjectAdminMode && <SettingsPatronModeBox />}
        {!isProjectAdminMode && !isPatronMode && <SettingsShowOnboardingBox />}
      </div>
    </div>
  );
};

export default Settings;
