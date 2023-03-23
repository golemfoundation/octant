import React, { FC, useState, Fragment } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValueContainer from 'components/core/DoubleValue/DoubleValueContainer';
import ModalWithdrawEth from 'components/dedicated/ModalWithdrawEth/ModalWithdrawEth';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';

import UserEthWithdrawProps from './types';

const BoxWithdrawEth: FC<UserEthWithdrawProps> = ({ classNameBox }) => {
  const {
    metaState: { isConnected },
  } = useMetamask();
  const { data: withdrawableUserEth } = useWithdrawableUserEth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <Fragment>
      <BoxRounded
        alignment="left"
        buttonProps={{
          isDisabled: !isConnected,
          isHigh: true,
          label: 'Withdraw ETH Rewards',
          onClick: () => setIsModalOpen(true),
          variant: 'secondary',
        }}
        className={classNameBox}
        isVertical
        title="Available to withdraw"
      >
        <DoubleValueContainer cryptoCurrency="ethereum" valueCrypto={withdrawableUserEth} />
      </BoxRounded>
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
