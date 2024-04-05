import React, { ReactElement } from 'react';
import { useAccount } from 'wagmi';

import SettingsCryptoMainValueBox from 'components/Settings/SettingsCryptoMainValueBox';
import SettingsCurrencyBox from 'components/Settings/SettingsCurrencyBox';
import SettingsLinkBoxes from 'components/Settings/SettingsLinkBoxes';
import SettingsLinksInfoBox from 'components/Settings/SettingsLinksInfoBox';
import SettingsMainInfoBox from 'components/Settings/SettingsMainInfoBox';
import SettingsPatronModeBox from 'components/Settings/SettingsPatronModeBox';
import SettingsShowOnboardingBox from 'components/Settings/SettingsShowOnboardingBox';
import SettingsShowTipsBox from 'components/Settings/SettingsShowTipsBox';
import Layout from 'components/shared/Layout';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './SettingsView.module.scss';

const SettingsView = (): ReactElement => {
  const { isDesktop } = useMediaQuery();
  const { isConnected } = useAccount();

  const isProjectAdminMode = useIsProjectAdminMode();

  return (
    <Layout dataTest="SettingsView">
      {!isProjectAdminMode && (
        <>
          <div className={styles.infoBoxesWrapper}>
            <SettingsMainInfoBox />
            {isDesktop && <SettingsLinksInfoBox />}
          </div>
          {!isDesktop && <SettingsLinkBoxes />}
        </>
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
    </Layout>
  );
};

export default SettingsView;
