import { ethers } from 'ethers';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';

import Button from 'components/core/button/button.component';

import MainLayoutProps from './types';
import styles from './style.module.scss';

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const {
    connect,
    metaState: { isConnected },
  } = useMetamask();

  const authUser = async () => {
    if (!isConnected) {
      await connect(ethers.providers.Web3Provider, 'any');
    }
  };

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
        <Button {...buttonProps} />
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
};

export default MainLayout;
