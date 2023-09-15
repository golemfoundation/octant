import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import WithdrawEth from 'components/dedicated/WithdrawEth/WithdrawEth';

import ModalEthWithdrawingProps from './types';

const ModalWithdrawEth: FC<ModalEthWithdrawingProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalWithdrawEth',
  });

  return (
    <Modal header={t('withdrawETH')} {...modalProps}>
      <WithdrawEth />
    </Modal>
  );
};

export default ModalWithdrawEth;
