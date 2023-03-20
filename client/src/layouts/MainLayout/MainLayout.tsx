import cx from 'classnames';
import React, { FC, useState, Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { useMetamask } from 'use-metamask';

import Button from 'components/core/Button/Button';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import WalletModal from 'components/dedicated/WalletModal/WalletModal';
import env from 'env';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIndividualReward from 'hooks/queries/useIndividualReward';
import useWallet from 'store/models/wallet/store';
import { octant } from 'svg/logo';
import { chevronBottom } from 'svg/misc';
import truncateEthAddress from 'utils/truncateEthAddress';

import styles from './MainLayout.module.scss';
import MainLayoutProps from './types';
import { getIndividualRewardText, getNavigationTabsWithAllocations } from './utils';

const MainLayout: FC<MainLayoutProps> = ({
  children,
  navigationBottomSuffix,
  isHeaderVisible = true,
  isLoading,
  isNavigationVisible = true,
  landscapeImage,
  classNameBody,
  navigationTabs,
  allocations,
}) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const { connect: connectHook, getAccounts } = useMetamask();
  const {
    connect,
    wallet: { isConnected, address },
  } = useWallet();
  const { data: individualReward } = useIndividualReward();
  const { data: currentEpoch } = useCurrentEpoch();
  const { pathname } = useLocation();

  const authUser = async () => {
    if (connectHook && !isConnected) {
      await connect(connectHook, getAccounts);
    }
  };

  const tabsWithIsActive = getNavigationTabsWithAllocations(allocations, navigationTabs).map(
    tab => ({
      ...tab,
      isActive: tab.isActive || pathname === tab.to,
    }),
  );

  return (
    <Fragment>
      <WalletModal
        modalProps={{
          isOpen: isWalletModalOpen,
          onClosePanel: () => setIsWalletModalOpen(false),
        }}
      />
      <div className={styles.root}>
        {isHeaderVisible && (
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <Svg img={octant} size={4} />
              {env.isTestnet === 'true' && (
                <div className={styles.testnetIndicatorWrapper}>
                  <div className={styles.testnetIndicator}>GOERLI</div>
                </div>
              )}
            </div>
            <div className={styles.buttons}>
              {isConnected && address ? (
                <div className={styles.profileInfo} onClick={() => setIsWalletModalOpen(true)}>
                  <div className={styles.walletInfo}>
                    <div className={styles.address}>{truncateEthAddress(address)}</div>
                    <div className={styles.budget}>
                      {getIndividualRewardText({ currentEpoch, individualReward })}
                    </div>
                  </div>
                  <Button
                    className={cx(
                      styles.walletButton,
                      isWalletModalOpen && styles.isWalletModalOpen,
                    )}
                    Icon={<Svg img={chevronBottom} size={0.8} />}
                    onClick={() => {}}
                    variant="iconOnlyTransparent2"
                  />
                </div>
              ) : (
                <Button isSmallFont label="Connect wallet" onClick={authUser} variant="cta" />
              )}
            </div>
          </div>
        )}
        {landscapeImage}
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
          <div className={styles.navigationWrapper}>
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
                {tabsWithIsActive.map(({ icon, iconWrapped, ...rest }, index) => (
                  <Button
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className={styles.buttonNavigation}
                    Icon={iconWrapped || <Svg img={icon} size={3.2} />}
                    variant="iconVertical"
                    {...rest}
                  />
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default MainLayout;
