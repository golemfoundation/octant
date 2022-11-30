import { ethers } from 'ethers';
import { useLocation } from 'react-router-dom';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';
import cx from 'classnames';

import { ROOT_ROUTES } from 'routes/root-routes/routes';
import { allocate, earn, metrics, proposals, settings, userIcon } from 'svg/navigation';
import { hexagon } from 'svg/logo';
import Button from 'components/core/button/button.component';
import Svg from 'components/core/svg/svg.component';
import truncateEthAddress from 'utils/truncateEthAddress';

import MainLayoutProps from './types';
import styles from './style.module.scss';

const getTabs = () => [
  {
    icon: proposals,
    label: 'Projects',
    to: ROOT_ROUTES.proposals.absolute,
  },
  {
    icon: allocate,
    label: 'Allocate',
    to: ROOT_ROUTES.allocation.absolute,
  },
  {
    icon: metrics,
    label: 'Metrics',
    to: ROOT_ROUTES.metrics.absolute,
  },
  {
    icon: earn,
    label: 'Earn',
    to: ROOT_ROUTES.earn.absolute,
  },
  {
    icon: settings,
    label: 'Settings',
    to: ROOT_ROUTES.settings.absolute,
  },
];

const MainLayout: FC<MainLayoutProps> = ({ children, navigationBottomSuffix }) => {
  const {
    connect,
    metaState: { isConnected, account },
  } = useMetamask();
  const { pathname } = useLocation();
  const address = account[0];

  const authUser = async () => {
    if (!isConnected) {
      await connect(ethers.providers.Web3Provider, 'any');
    }
  };

  const tabsWithIsActive = getTabs().map(tab => {
    return {
      ...tab,
      isActive: pathname === tab.to,
    };
  });

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Svg img={hexagon} size={3} />
        {isConnected ? (
          <div className={styles.walletInfo}>
            <div className={styles.address}>{truncateEthAddress(address)}</div>
            <Svg img={userIcon} size={3} />
          </div>
        ) : (
          <Button label="Connect wallet" onClick={authUser} variant="cta" />
        )}
      </div>
      <div className={styles.body}>{children}</div>
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
          {tabsWithIsActive.map(({ icon, ...rest }, index) => (
            <Button
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={styles.button}
              Icon={<Svg img={icon} size={[2.25, 'auto']} />}
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
