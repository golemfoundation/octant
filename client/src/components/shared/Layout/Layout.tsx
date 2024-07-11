import cx from 'classnames';
import React, { FC, useState, Fragment, useMemo, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

import LayoutNavbar from 'components/shared/Layout/LayoutNavbar';
import ModalLayoutConnectWallet from 'components/shared/Layout/ModalLayoutConnectWallet';
import ModalLayoutWallet from 'components/shared/Layout/ModalLayoutWallet';
import Button from 'components/ui/Button';
import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import { ELEMENT_POSITION_FIXED_CLASSNAME } from 'constants/css';
import { LAYOUT_BODY_ID } from 'constants/domElementsIds';
import {
  adminNavigationTabs,
  navigationTabs as navigationTabsDefault,
  patronNavigationTabs,
} from 'constants/navigationTabs/navigationTabs';
import networkConfig from 'constants/networkConfig';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useUserTOS from 'hooks/queries/useUserTOS';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useSettingsStore from 'store/settings/store';
import { octant } from 'svg/logo';
import { chevronBottom } from 'svg/misc';
import { chevronLeft } from 'svg/navigation';
import getDifferenceInWeeks from 'utils/getDifferenceInWeeks';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import getTimeDistance from 'utils/getTimeDistance';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './Layout.module.scss';
import LayoutProps from './types';

const Layout: FC<LayoutProps> = ({
  children,
  dataTest,
  navigationBottomSuffix,
  isHeaderVisible = true,
  isLoading,
  isNavigationVisible = true,
  classNameBody,
  isAbsoluteHeaderPosition = false,
  showHeaderBlur = true,
}) => {
  const { data: isPatronMode } = useIsPatronMode();
  const { i18n, t } = useTranslation('translation', { keyPrefix: 'layouts.main' });
  const [isModalConnectWalletOpen, setIsModalConnectWalletOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { data: individualReward } = useIndividualReward();
  const { data: currentEpoch } = useCurrentEpoch();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { data: isUserTOSAccepted } = useUserTOS();
  const isProjectAdminMode = useIsProjectAdminMode();
  const {
    data: { isCryptoMainValueDisplay },
  } = useSettingsStore(({ data }) => ({
    data: {
      isCryptoMainValueDisplay: data.isCryptoMainValueDisplay,
    },
  }));

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isAllocationRoot = !!useMatch(ROOT_ROUTES.allocation.absolute);
  const isUseMatchProject = !!useMatch(ROOT_ROUTES.projectWithAddress.absolute);
  const isUseMatchProjectWithAddress = !!useMatch(ROOT_ROUTES.projectWithAddress.absolute);
  const isProjectRoot = isUseMatchProject || isUseMatchProjectWithAddress;
  const isProjectsRoot = !!useMatch(ROOT_ROUTES.projects.absolute);
  const getValuesToDisplay = useGetValuesToDisplay();

  const showAllocationPeriod = isAllocationRoot || isProjectRoot || isProjectsRoot;

  const getCurrentPeriod = () => {
    if (isDecisionWindowOpen && timeCurrentAllocationEnd) {
      return getTimeDistance(Date.now(), new Date(timeCurrentAllocationEnd).getTime());
    }
    if (!isDecisionWindowOpen && timeCurrentEpochEnd) {
      return getTimeDistance(Date.now(), new Date(timeCurrentEpochEnd).getTime());
    }
    return '';
  };
  const [currentPeriod, setCurrentPeriod] = useState(() => getCurrentPeriod());

  const tabsWithIsActive = useMemo(() => {
    let tabs = navigationTabsDefault;

    if (isPatronMode) {
      tabs = patronNavigationTabs;
    }
    if (isProjectAdminMode) {
      tabs = adminNavigationTabs;
    }

    return tabs.map(tab => {
      const isProjectView =
        pathname.includes(`${ROOT_ROUTES.project.absolute}/`) &&
        tab.to === ROOT_ROUTES.projects.absolute;
      return {
        ...tab,
        icon: isProjectView ? chevronLeft : tab.icon,
        isActive: tab.isActive || pathname === tab.to || isProjectView,
        isDisabled: isPreLaunch && tab.to !== ROOT_ROUTES.earn.absolute,
      };
    });
  }, [isPatronMode, isProjectAdminMode, isPreLaunch, pathname]);

  const isAllocationPeriodIsHighlighted = useMemo(() => {
    if (isDecisionWindowOpen && timeCurrentAllocationEnd) {
      return getDifferenceInWeeks(Date.now(), new Date(timeCurrentAllocationEnd).getTime()) < 1;
    }
    if (!isDecisionWindowOpen && timeCurrentEpochEnd) {
      return getDifferenceInWeeks(Date.now(), new Date(timeCurrentEpochEnd).getTime()) < 1;
    }
    return false;
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  const individualRewardText = useMemo(() => {
    if (currentEpoch === 1 || individualReward === 0n || !isDecisionWindowOpen) {
      return i18n.t('layouts.main.noRewardsYet');
    }
    if (currentEpoch === undefined || individualReward === undefined) {
      return i18n.t('layouts.main.loadingRewardBudget');
    }
    return i18n.t('common.rewards', {
      rewards: getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        valueCrypto: individualReward,
      }).primary,
    });
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [individualReward, currentEpoch, isDecisionWindowOpen, isCryptoMainValueDisplay]);

  const onLogoClick = () => {
    if (pathname === ROOT_ROUTES.projects.absolute) {
      window.scrollTo({ behavior: 'smooth', top: 0 });
      return;
    }

    navigate(ROOT_ROUTES.projects.absolute);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPeriod(getCurrentPeriod());
    }, 1000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  return (
    <Fragment>
      <ModalLayoutWallet
        modalProps={{
          isOpen: isWalletModalOpen,
          onClosePanel: () => setIsWalletModalOpen(false),
        }}
      />
      <ModalLayoutConnectWallet
        modalProps={{
          isOpen: isModalConnectWalletOpen,
          onClosePanel: () => setIsModalConnectWalletOpen(false),
        }}
      />
      <div className={styles.root} data-test={dataTest}>
        {isHeaderVisible && (
          <Fragment>
            {showHeaderBlur && <div className={styles.headerBlur} />}
            <div
              className={cx(
                styles.headerWrapper,
                ELEMENT_POSITION_FIXED_CLASSNAME,
                isAbsoluteHeaderPosition && styles.isAbsoluteHeaderPosition,
              )}
            >
              <div className={styles.header} data-test="MainLayout__Header">
                <div className={styles.logo} data-test="MainLayout__Logo" onClick={onLogoClick}>
                  <Svg img={octant} size={4} />
                  {networkConfig.isTestnet && (
                    <div className={styles.testnetIndicatorWrapper}>
                      <div className={styles.testnetIndicator}>{networkConfig.name}</div>
                    </div>
                  )}
                </div>
                <div className={styles.buttons}>
                  {isConnected && address ? (
                    <div
                      className={styles.profileInfo}
                      data-test="ProfileInfo"
                      onClick={() => isUserTOSAccepted && setIsWalletModalOpen(true)}
                    >
                      <div className={styles.walletInfo}>
                        <div className={styles.addressWrapper}>
                          {(isProjectAdminMode || isPatronMode) && (
                            <div
                              className={cx(
                                styles.badge,
                                isProjectAdminMode && styles.isProjectAdminMode,
                              )}
                              data-test="ProfileInfo__badge"
                            >
                              {isProjectAdminMode ? t('admin') : t('patron')}
                            </div>
                          )}

                          <div
                            className={cx(
                              styles.address,
                              isProjectAdminMode && styles.isProjectAdminMode,
                              !isProjectAdminMode && isPatronMode && styles.isPatronMode,
                            )}
                          >
                            {truncateEthAddress(address)}
                          </div>
                        </div>
                        {!!currentEpoch &&
                          currentEpoch > 1 &&
                          (showAllocationPeriod ? (
                            <div className={styles.allocationPeriod}>
                              <Trans
                                components={[
                                  <span
                                    className={cx(
                                      isAllocationPeriodIsHighlighted && styles.highlighted,
                                    )}
                                  />,
                                ]}
                                i18nKey={
                                  isDecisionWindowOpen
                                    ? 'layouts.main.allocationEndsIn'
                                    : 'layouts.main.allocationStartsIn'
                                }
                                values={{ currentPeriod }}
                              />
                            </div>
                          ) : (
                            <div className={styles.budget}>{individualRewardText}</div>
                          ))}
                      </div>
                      <Button
                        className={cx(
                          styles.buttonWallet,
                          isWalletModalOpen && styles.isWalletModalOpen,
                        )}
                        Icon={<Svg img={chevronBottom} size={0.8} />}
                        isEventStopPropagation={false}
                        variant="iconOnlyTransparent2"
                      />
                    </div>
                  ) : (
                    <Button
                      className={styles.buttonConnect}
                      dataTest="MainLayout__Button--connect"
                      isDisabled={isPreLaunch}
                      isSmallFont
                      label={t('buttonConnect')}
                      onClick={() => setIsModalConnectWalletOpen(true)}
                      variant="cta"
                    />
                  )}
                </div>
              </div>
            </div>
          </Fragment>
        )}
        <div
          className={cx(
            styles.body,
            isLoading && styles.isLoading,
            !!navigationBottomSuffix && styles.isNavigationBottomSuffix,
            classNameBody,
          )}
          data-test="MainLayout__body"
          id={LAYOUT_BODY_ID}
        >
          {isLoading ? <Loader dataTest="MainLayout__Loader" /> : children}
        </div>
        {isNavigationVisible && (
          <LayoutNavbar navigationBottomSuffix={navigationBottomSuffix} tabs={tabsWithIsActive} />
        )}
      </div>
    </Fragment>
  );
};

export default Layout;
