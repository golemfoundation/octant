import { ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useLocation } from 'react-router-dom';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';
import cx from 'classnames';

import { allocateWithNumber, userGenericIcon } from 'svg/navigation';
import { hexagon } from 'svg/logo';
import { navigationTabs as navigationTabsDefault } from 'constants/navigationTabs/navigationTabs';
import Button from 'components/core/Button/Button';
import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import env from 'env';
import truncateEthAddress from 'utils/truncateEthAddress';
import useIndividualReward from 'hooks/useIndividualReward';

import MainLayoutProps from './types';
import styles from './style.module.scss';

const getNavigationTabsWithAllocations = (
  idsInAllocation: number[] | undefined,
  navigationTabs = navigationTabsDefault,
) => {
  const newNavigationTabs = [...navigationTabs];
  newNavigationTabs[1] =
    idsInAllocation && idsInAllocation.length > 0
      ? {
          ...newNavigationTabs[1],
          iconWrapped: (
            <div className={styles.iconNumberOfAllocations}>
              <div className={styles.numberOfAllocations}>{idsInAllocation.length}</div>
              <Svg img={allocateWithNumber} size={2.25} />
            </div>
          ),
        }
      : newNavigationTabs[1];
  return newNavigationTabs;
};

const MainLayout: FC<MainLayoutProps> = ({
  children,
  navigationBottomSuffix,
  isHeaderVisible = true,
  isLoading,
  landscapeImage,
  classNameBody,
  navigationTabs,
  allocations,
}) => {
  const {
    connect,
    metaState: { isConnected, account },
  } = useMetamask();
  const { data: individualReward } = useIndividualReward();
  const { pathname } = useLocation();
  const address = account[0];

  const authUser = async () => {
    if (!isConnected) {
      await connect(ethers.providers.Web3Provider, 'any');
    }
  };

  const tabsWithIsActive = getNavigationTabsWithAllocations(allocations, navigationTabs).map(
    tab => {
      return {
        ...tab,
        isActive: tab.isActive || pathname === tab.to,
      };
    },
  );

  return (
    <div className={styles.root}>
      {isHeaderVisible && (
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Svg img={hexagon} size={4} />
            {env.isTestnet === 'true' && (
              <div className={styles.testnetIndicatorWrapper}>
                <div className={styles.testnetIndicator}>GOERLI</div>
              </div>
            )}
          </div>
          {isConnected ? (
            <div className={styles.profileInfo}>
              <div className={styles.walletInfo}>
                <div className={styles.address}>{truncateEthAddress(address)}</div>
                <div className={styles.budget}>
                  {individualReward
                    ? `Budget ${formatUnits(individualReward)} ETH`
                    : 'Loading reward budget...'}
                </div>
              </div>
              <Svg img={userGenericIcon} size={3.2} />
            </div>
          ) : (
            <Button label="Connect wallet" onClick={authUser} variant="cta" />
          )}
        </div>
      )}
      {landscapeImage}
      <div className={cx(styles.body, isLoading && styles.isLoading, classNameBody)}>
        {isLoading ? <Loader className={styles.loader} /> : children}
      </div>
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
              className={styles.button}
              Icon={iconWrapped || <Svg img={icon} size={2.25} />}
              variant="iconVertical"
              {...rest}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
