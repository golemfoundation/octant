import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import EarnRewardsCalculator from 'components/Earn/EarnRewardsCalculator';
import Modal from 'components/ui/Modal';

import ModalEarnRewardsCalculatorProps from './types';

const ModalEarnRewardsCalculator: FC<ModalEarnRewardsCalculatorProps> = ({ modalProps }) => {
  const { i18n } = useTranslation('translation');

  return (
    <Modal
      dataTest="ModalRewardsCalculator"
      header={i18n.t('common.calculateRewards')}
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
    >
      <EarnRewardsCalculator />
    </Modal>
  );
};

export default ModalEarnRewardsCalculator;
