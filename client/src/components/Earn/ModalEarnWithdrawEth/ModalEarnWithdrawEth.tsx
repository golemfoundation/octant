import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import EarnWithdrawEth from 'components/Earn/EarnWithdrawEth';
import Modal from 'components/ui/Modal';

import ModalEarnWithdrawingProps from './types';

const ModalEarnWithdrawEth: FC<ModalEarnWithdrawingProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalWithdrawEth',
  });

  return (
    <Modal header={t('withdrawETH')} {...modalProps}>
      <EarnWithdrawEth onCloseModal={modalProps.onClosePanel} />
    </Modal>
  );
};

export default ModalEarnWithdrawEth;
