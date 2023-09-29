import cx from 'classnames';
import React, { FC, useState, Fragment, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { useAccount } from 'wagmi';

import Button from 'components/core/Button/Button';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import ModalConnectWallet from 'components/dedicated/ModalConnectWallet/ModalConnectWallet';
import Navbar from 'components/dedicated/Navbar/Navbar';
import WalletModal from 'components/dedicated/WalletModal/WalletModal';
import {
  adminNavigationTabs,
  navigationTabs as navigationTabsDefault,
} from 'constants/navigationTabs/navigationTabs';
import networkConfig from 'constants/networkConfig';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUserTOS from 'hooks/queries/useUserTOS';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import { octant } from 'svg/logo';
import { chevronBottom } from 'svg/misc';
import getDifferenceInWeeks from 'utils/getDifferenceInWeeks';
import getIsPreLaunch from 'utils/getIsPreLaunch';
import getTimeDistance from 'utils/getTimeDistance';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './MainLayout.module.scss';
import MainLayoutProps from './types';
import { getIndividualRewardText } from './utils';

const MainLayout: FC<MainLayoutProps> = ({
  children,
  dataTest,
  navigationBottomSuffix,
  isHeaderVisible = true,
  isLoading,
  isNavigationVisible = true,
  classNameBody,
  navigationTabs = navigationTabsDefault,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'layouts.main' });
  const [isModalConnectWalletOpen, setIsModalConnectWalletOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { data: individualReward } = useIndividualReward();
  const { data: currentEpoch } = useCurrentEpoch();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { pathname } = useLocation();
  const { data: isUserTOSAccepted } = useUserTOS();
  const isProjectAdminMode = useIsProjectAdminMode();

  const isPreLaunch = getIsPreLaunch(currentEpoch);
  const isAllocationRoot = !!useMatch(ROOT_ROUTES.allocation.absolute);
  const isProposalRoot =
    !!useMatch(ROOT_ROUTES.proposal.absolute) ||
    // eslint-disable-next-line react-hooks/rules-of-hooks
    !!useMatch(ROOT_ROUTES.proposalWithAddress.absolute);
  const isProposalsRoot = !!useMatch(ROOT_ROUTES.proposals.absolute);

  const showAllocationPeriod = isAllocationRoot || isProposalRoot || isProposalsRoot;

  const tabsWithIsActive = (isProjectAdminMode ? adminNavigationTabs : navigationTabs).map(tab => ({
    ...tab,
    isActive: tab.isActive || pathname === tab.to,
    isDisabled: isPreLaunch && tab.to !== ROOT_ROUTES.earn.absolute,
  }));

  const allocationPeriod = useMemo(() => {
    if (isDecisionWindowOpen && timeCurrentAllocationEnd) {
      return getTimeDistance(Date.now(), new Date(timeCurrentAllocationEnd).getTime());
    }
    if (!isDecisionWindowOpen && timeCurrentEpochEnd) {
      return getTimeDistance(Date.now(), new Date(timeCurrentEpochEnd).getTime());
    }

    return '';
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  const isAllocationPeriodIsHighlighted = useMemo(() => {
    if (isDecisionWindowOpen && timeCurrentAllocationEnd) {
      return getDifferenceInWeeks(Date.now(), new Date(timeCurrentAllocationEnd).getTime()) < 1;
    }
    if (!isDecisionWindowOpen && timeCurrentEpochEnd) {
      return getDifferenceInWeeks(Date.now(), new Date(timeCurrentEpochEnd).getTime()) < 1;
    }
    return false;
  }, [isDecisionWindowOpen, timeCurrentAllocationEnd, timeCurrentEpochEnd]);

  return (
    <Fragment>
      <WalletModal
        modalProps={{
          isOpen: isWalletModalOpen,
          onClosePanel: () => setIsWalletModalOpen(false),
        }}
      />
      <ModalConnectWallet
        modalProps={{
          isOpen: isModalConnectWalletOpen,
          onClosePanel: () => setIsModalConnectWalletOpen(false),
        }}
      />
      <div className={styles.root} data-test={dataTest}>
        {isHeaderVisible && (
          <Fragment>
            <div className={styles.headerBlur} />
            <div className={styles.headerWrapper}>
              <div className={styles.header} data-test="MainLayout__Header">
                <div className={styles.logoWrapper}>
                  <Link data-test="MainLayout__Logo" to={ROOT_ROUTES.proposals.absolute}>
                    <Svg img={octant} size={4} />
                  </Link>
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
                          {isProjectAdminMode && (
                            <div className={styles.adminBadge}>{t('admin')}</div>
                          )}
                          <div
                            className={cx(
                              styles.address,
                              isProjectAdminMode && styles.isProjectAdminMode,
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
                                values={{ allocationPeriod }}
                              />
                            </div>
                          ) : (
                            <div className={styles.budget}>
                              {getIndividualRewardText({ currentEpoch, individualReward })}
                            </div>
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
        >
          {isLoading ? (
            <Loader className={styles.loader} dataTest="MainLayout__Loader" />
          ) : (
            children
          )}
        </div>
        {isNavigationVisible && (
          <Navbar navigationBottomSuffix={navigationBottomSuffix} tabs={tabsWithIsActive} />
        )}
      </div>
    </Fragment>
  );
};

export default MainLayout;
