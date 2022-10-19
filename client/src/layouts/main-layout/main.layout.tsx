import { ethers } from 'ethers';
import { useLocation } from 'react-router-dom';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';

import { ROOT_ROUTES } from 'routes/root-routes/routes';
import { hexagon } from 'svg/logo';
import Button from 'components/core/button/button.component';
import Svg from 'components/core/svg/svg.component';

import MainLayoutProps from './types';
import styles from './style.module.scss';

const getTabs = () => [
  {
    label: 'Stats',
    to: ROOT_ROUTES.stats.absolute,
  },
  {
    label: 'Proposals',
    to: ROOT_ROUTES.proposals.absolute,
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
        label: 'MetMask connected',
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
        {tabsWithIsActive.map((button, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Button key={index} {...button} />
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;
