import React, { ReactElement } from 'react';
import { useAccount } from 'wagmi';

import SettingsCryptoMainValueBox from 'components/Settings/SettingsCryptoMainValueBox';
import SettingsCurrencyBox from 'components/Settings/SettingsCurrencyBox';
import SettingsLinkBoxes from 'components/Settings/SettingsLinkBoxes';
import SettingsMainInfoBox from 'components/Settings/SettingsMainInfoBox';
import SettingsPatronModeBox from 'components/Settings/SettingsPatronModeBox';
import SettingsShowOnboardingBox from 'components/Settings/SettingsShowOnboardingBox';
import SettingsShowTipsBox from 'components/Settings/SettingsShowTipsBox';
import Layout from 'components/shared/Layout';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';

import styles from './SettingsView.module.scss';

const SettingsView = (): ReactElement => {
  const { isConnected } = useAccount();

  const isProjectAdminMode = useIsProjectAdminMode();

  return (
    <Layout dataTest="SettingsView">
      {!isProjectAdminMode && (
        <div className={styles.boxesWrapper}>
          <SettingsMainInfoBox />
        </div>
      )}
      <SettingsCurrencyBox />
      <SettingsCryptoMainValueBox />
      {isConnected && !isProjectAdminMode && <SettingsPatronModeBox />}
      {!isProjectAdminMode && (
        <>
          <SettingsShowTipsBox />
          <SettingsShowOnboardingBox />
        </>
      )}
      <SettingsLinkBoxes />
    </Layout>
  );
};

export default SettingsView;
