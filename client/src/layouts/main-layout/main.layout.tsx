import { ethers } from 'ethers';
import { useMetamask } from 'use-metamask';
import React, { FC } from 'react';

import { useProposalsContract } from 'hooks/useContract';
import Button from 'components/core/button/button.component';

import MainLayoutProps from './types';

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const {
    connect,
    metaState: { isConnected, web3 },
  } = useMetamask();
  // @ts-ignore
  const proposalsAddress = import.meta.env.VITE_PROPOSALS_ADDRESS;

  const authUser = async () => {
    if (!isConnected) {
      await connect(ethers.providers.Web3Provider, 'any');
    }
  };

  /* eslint-disable-next-line */
  const contract = useProposalsContract(proposalsAddress, web3);

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
