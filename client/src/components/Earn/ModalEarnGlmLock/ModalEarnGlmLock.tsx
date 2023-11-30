import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EarnGlmLock from 'components/Earn/EarnGlmLock';
import { CurrentMode } from 'components/Earn/EarnGlmLock/types';
import Modal from 'components/ui/Modal';

import ModalEarnGlmLockProps from './types';

const ModalEarnGlmLock: FC<ModalEarnGlmLockProps> = ({ modalProps }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalGlmLock',
  });
  const [currentMode, setCurrentMode] = useState<CurrentMode>('lock');

  const modalHeader = currentMode === 'lock' ? i18n.t('common.lockGlm') : t('unlockGLM');

  return (
    <Modal header={modalHeader} {...modalProps}>
      <EarnGlmLock
        currentMode={currentMode}
        onCloseModal={modalProps.onClosePanel}
        onCurrentModeChange={setCurrentMode}
      />
    </Modal>
  );
};

export default ModalEarnGlmLock;
