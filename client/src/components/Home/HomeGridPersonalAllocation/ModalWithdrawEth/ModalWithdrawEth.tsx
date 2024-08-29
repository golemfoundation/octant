import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/ui/Modal';

import ModalWithdrawEthProps from './types';
import WithdrawEth from './WithdrawEth';

const ModalWithdrawEth: FC<ModalWithdrawEthProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridPersonalAllocation.modalWithdrawEth',
  });

  return (
    <Modal header={t('withdrawETH')} {...modalProps}>
      <WithdrawEth onCloseModal={modalProps.onClosePanel} />
    </Modal>
  );
};

export default ModalWithdrawEth;
