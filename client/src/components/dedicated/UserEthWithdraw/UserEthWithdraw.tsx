import React, { FC, useState, Fragment } from 'react';
import { useMetamask } from 'use-metamask';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import EthWithdrawingFlow from 'components/dedicated/EthWithdrawingFlow/EthWithdrawingFlow';
import useWithdrawableUserEth from 'hooks/queries/useWithdrawableUserEth';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import UserEthWithdrawProps from './types';

const UserEthWithdraw: FC<UserEthWithdrawProps> = ({ classNameBox }) => {
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
        <DoubleValue
          mainValue={
            withdrawableUserEth ? getFormattedEthValue(withdrawableUserEth).fullString : '0.0'
          }
        />
      </BoxRounded>
      <EthWithdrawingFlow
        modalProps={{
          isOpen: isModalOpen,
          onClosePanel: () => setIsModalOpen(false),
        }}
      />
    </Fragment>
  );
};

export default UserEthWithdraw;
