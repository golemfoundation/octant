import { ethers } from 'ethers';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';

import Button from 'components/core/button/button.component';

import MainLayoutProps from './types';

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
    <div>
      <div>
        <Button label="Connect MetaMask" onClick={authUser} />
      </div>
      {children}
    </div>
  );
};

export default MainLayout;
