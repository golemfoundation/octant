import React, { FC, useState, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalWithdrawEth from 'components/dedicated/ModalWithdrawEth/ModalWithdrawEth';
import RewardsBox from 'components/dedicated/RewardsBox/RewardsBox';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';

import BoxWithdrawEthProps from './types';

const BoxWithdrawEth: FC<BoxWithdrawEthProps> = ({ classNameBox }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.boxWithdrawEth',
  });
  const { isConnected } = useAccount();
  const { data: currentEpoch } = useCurrentEpoch();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isEpoch1 = currentEpoch === 1;

  return (
    <Fragment>
      <RewardsBox
        buttonProps={{
          dataTest: 'BoxWithdrawEth__RewardsBox__Button',
          isDisabled: isEpoch1 || !isConnected,
          isHigh: true,
          label: t('withdrawRewards'),
          onClick: () => setIsModalOpen(true),
          variant: 'secondary',
        }}
        className={classNameBox}
        isDisabled={isEpoch1}
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
