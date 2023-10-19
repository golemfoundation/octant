// import loadable from '@loadable/component';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import RewardsCalculator from 'components/dedicated/RewardsCalculator/RewardsCalculator';

import ModalRewardsCalculatorProps from './types';

const ModalRewardsCalculator: FC<ModalRewardsCalculatorProps> = ({ modalProps }) => {
  const { i18n } = useTranslation('translation');

  return (
    <Modal
      dataTest="ModalRewardsCalculator"
      header={i18n.t('common.calculateRewards')}
      isOpen={modalProps.isOpen}
      onClosePanel={modalProps.onClosePanel}
    >
      <RewardsCalculator />
    </Modal>
  );
};

export default ModalRewardsCalculator;
