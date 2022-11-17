import { ethers } from 'ethers';
import { useLocation } from 'react-router-dom';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';

import { ROOT_ROUTES } from 'routes/root-routes/routes';
import { allocate, earn, metrics, projects, settings } from 'svg/navigation';
import { hexagon } from 'svg/logo';
import Button from 'components/core/button/button.component';
import Svg from 'components/core/svg/svg.component';

import MainLayoutProps from './types';
import styles from './style.module.scss';

const getTabs = () => [
  {
    icon: projects,
    label: 'Projects',
    to: ROOT_ROUTES.projects.absolute,
  },
  {
    icon: allocate,
    label: 'Allocate',
    to: ROOT_ROUTES.deposits.absolute,
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

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const {
    connect,
    metaState: { isConnected },
  } = useMetamask();
  const { pathname } = useLocation();

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

  const buttonProps = isConnected
    ? {
        isDisabled: true,
        label: 'MetaMask connected',
        onClick: () => {},
      }
    : {
        label: 'Connect MetaMask',
        onClick: authUser,
      };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Svg classNameSvg={styles.logo} img={hexagon} />
        <Button {...buttonProps} />
      </div>
      <div className={styles.body}>{children}</div>
      <nav className={styles.navigation}>
        {tabsWithIsActive.map(({ icon, ...rest }, index) => (
          <Button
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={styles.button}
            Icon={<Svg img={icon} />}
            variant="iconVertical"
            {...rest}
          />
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
