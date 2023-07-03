import cx from 'classnames';
import React, { FC, useState, Fragment, useEffect, useRef, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useLocation, useMatch } from 'react-router-dom';
import { useAccount } from 'wagmi';

import Button from 'components/core/Button/Button';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import ModalConnectWallet from 'components/dedicated/ModalConnectWallet/ModalConnectWallet';
import WalletModal from 'components/dedicated/WalletModal/WalletModal';
import { IS_INITIAL_LOAD_DONE } from 'constants/dataAttributes';
import networkConfig from 'constants/networkConfig';
import env from 'env';
import useEpochAndAllocationTimestamps from 'hooks/helpers/useEpochAndAllocationTimestamps';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useAllocationsStore from 'store/allocations/store';
import { octant } from 'svg/logo';
import { chevronBottom } from 'svg/misc';
import getDifferenceInWeeks from 'utils/getDifferenceInWeeks';
import getTimeDistance from 'utils/getTimeDistance';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './MainLayout.module.scss';
import MainLayoutProps from './types';
import { getIndividualRewardText, getNavigationTabsWithAllocations } from './utils';

const MainLayout: FC<MainLayoutProps> = ({
  children,
  dataTest,
  navigationBottomSuffix,
  isHeaderVisible = true,
  isLoading,
  isNavigationVisible = true,
  classNameBody,
  navigationTabs,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'layouts.main' });
  const numberOfAllocationsRef = useRef<HTMLDivElement>(null);
  const [isModalConnectWalletOpen, setIsModalConnectWalletOpen] = useState(false);
  const [localAllocationsLenght, setLocalAllocationsLenght] = useState<number>();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isAllocationValueChanging, setIsAllocationValueChanging] = useState<boolean>(false);
  const { allocations } = useAllocationsStore(state => ({
    allocations: state.data.allocations,
  }));
  const { address, isConnected } = useAccount();
  const { data: individualReward } = useIndividualReward();
  const { data: currentEpoch } = useCurrentEpoch();
  const { timeCurrentAllocationEnd, timeCurrentEpochEnd } = useEpochAndAllocationTimestamps();
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const { pathname } = useLocation();

  useEffect(() => {
    if (localAllocationsLenght && localAllocationsLenght === allocations?.length) {
      numberOfAllocationsRef?.current?.setAttribute(IS_INITIAL_LOAD_DONE, 'true');
    }
  }, [localAllocationsLenght, allocations?.length]);

  useEffect(() => {
    setLocalAllocationsLenght(allocations?.length);
    setIsAllocationValueChanging(false);
  }, [allocations?.length]);

  useEffect(() => {
    if (localAllocationsLenght && localAllocationsLenght !== allocations?.length) {
      setIsAllocationValueChanging(true);
    }
  }, [localAllocationsLenght, allocations?.length]);

  useEffect(() => {
    if (isAllocationValueChanging) {
      setTimeout(() => {
        setIsAllocationValueChanging(false);
      }, 1000);
    }
  }, [isAllocationValueChanging]);

  const tabsWithIsActive = getNavigationTabsWithAllocations(
    allocations!,
    isAllocationValueChanging,
    numberOfAllocationsRef,
    navigationTabs,
  ).map(tab => ({
    ...tab,
    isActive: tab.isActive || pathname === tab.to,
  }));

  const isEpoch1 = currentEpoch === 1;
  const isAllocationRoot = !!useMatch(ROOT_ROUTES.allocation.absolute);
  const isProposalRoot =
    !!useMatch(ROOT_ROUTES.proposal.absolute) ||
    !!useMatch(ROOT_ROUTES.proposalWithAddress.absolute);
  const isProposalsRoot = !!useMatch(ROOT_ROUTES.proposals.absolute);

  const showAllocationPeriod = isAllocationRoot || isProposalRoot || isProposalsRoot;

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
              <div className={styles.header} data-test="Header__element">
                <div className={styles.logoWrapper}>
                  <Svg img={octant} size={4} />
                  {env.isTestnet === 'true' && (
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
                      onClick={() => setIsWalletModalOpen(true)}
                    >
                      <div className={styles.walletInfo}>
                        <div className={styles.address}>{truncateEthAddress(address)}</div>
                        {!isEpoch1 &&
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
                          styles.walletButton,
                          isWalletModalOpen && styles.isWalletModalOpen,
                        )}
                        Icon={<Svg img={chevronBottom} size={0.8} />}
                        isEventStopPropagation={false}
                        variant="iconOnlyTransparent2"
                      />
                    </div>
                  ) : (
                    <Button
                      dataTest="ConnectWalletButton"
                      isSmallFont
                      label={t('connectWallet')}
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
          {isLoading ? <Loader className={styles.loader} /> : children}
        </div>
        {isNavigationVisible && (
          <Fragment>
            <div className={styles.navigationWrapper} data-test="Navigation__element">
              <nav
                className={cx(
                  styles.navigation,
                  navigationBottomSuffix && styles.hasNavigationBottomSuffix,
                )}
              >
                {navigationBottomSuffix && (
                  <div className={styles.navigationBottomSuffix}>{navigationBottomSuffix}</div>
                )}
                <div className={styles.buttons}>
                  {tabsWithIsActive.map(({ icon, iconWrapped, label, ...rest }, index) => (
                    <Button
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      className={styles.buttonNavigation}
                      dataTest={`${label}__Button`}
                      Icon={iconWrapped || <Svg img={icon} size={3.2} />}
                      label={label}
                      variant="iconVertical"
                      {...rest}
                    />
                  ))}
                </div>
              </nav>
              <div className={styles.coinGecko}>Powered by CoinGecko API</div>
            </div>
            <div className={styles.navigationBlur} />
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default MainLayout;
