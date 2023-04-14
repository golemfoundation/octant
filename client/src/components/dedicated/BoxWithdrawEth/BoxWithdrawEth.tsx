import React, { FC, useState, Fragment } from 'react';
import { useAccount } from 'wagmi';

import ModalWithdrawEth from 'components/dedicated/ModalWithdrawEth/ModalWithdrawEth';
import RewardsBox from 'components/dedicated/RewardsBox/RewardsBox';

import BoxWithdrawEthProps from './types';

const BoxWithdrawEth: FC<BoxWithdrawEthProps> = ({ classNameBox }) => {
  const { isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <Fragment>
      <RewardsBox
        buttonProps={{
          isDisabled: !isConnected,
          isHigh: true,
          label: 'Withdraw Rewards',
          onClick: () => setIsModalOpen(true),
          variant: 'secondary',
        }}
        className={classNameBox}
      />
      <ModalWithdrawEth
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default BoxWithdrawEth;
