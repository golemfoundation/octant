import { ethers } from 'ethers';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';

import Button from 'components/core/button/button.component';

import MainLayoutProps from './types';
import styles from './styles.module.scss';

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

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <Button label="Connect MetaMask" onClick={authUser} />
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
};

export default MainLayout;
