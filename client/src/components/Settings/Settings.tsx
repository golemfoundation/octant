import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import SettingsCryptoMainValueBox from 'components/Settings/SettingsCryptoMainValueBox';
import SettingsCurrencyBox from 'components/Settings/SettingsCurrencyBox';
import SettingsLanguageSelectorBox from 'components/Settings/SettingsLanguageSelectorBox/SettingsLanguageSelectorBox';
import SettingsMainInfoBox from 'components/Settings/SettingsMainInfoBox';
import SettingsPatronModeBox from 'components/Settings/SettingsPatronModeBox';
import SettingsShowOnboardingBox from 'components/Settings/SettingsShowOnboardingBox';
import SettingsShowQuickTourBox from 'components/Settings/SettingsShowQuickTourBox';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './Settings.module.scss';
import SettingsShowHelpVideosBox from './SettingsShowHelpVideosBox';
import SettingsProps from './types';

const Settings: FC<SettingsProps> = ({ dataTest }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.settings' });
  const { isConnected } = useAccount();

  const { data: isPatronMode } = useIsPatronMode();
  const isProjectAdminMode = useIsProjectAdminMode();
  const dataTestRoot = dataTest ?? 'Settings';

  return (
    <div className={styles.root} data-test={dataTestRoot}>
      <div className={styles.title} data-test={`${dataTestRoot}__title`}>
        {t('title')}
      </div>
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
        {!isProjectAdminMode && !isPatronMode && <SettingsShowQuickTourBox />}
        <SettingsLanguageSelectorBox />
      </div>
    </div>
  );
};

export default Settings;
