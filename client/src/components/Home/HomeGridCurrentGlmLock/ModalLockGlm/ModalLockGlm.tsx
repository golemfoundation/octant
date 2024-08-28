import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LockGlm from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm';
import { CurrentMode } from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';
import Modal from 'components/ui/Modal';

import ModalLockGlmProps from './types';

const ModalLockGlm: FC<ModalLockGlmProps> = ({ modalProps }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock.modalLockGlm',
  });
  const [currentMode, setCurrentMode] = useState<CurrentMode>('lock');

  const modalHeader = currentMode === 'lock' ? i18n.t('common.lockGlm') : t('unlockGLM');

  return (
    <Modal header={modalHeader} {...modalProps}>
      <LockGlm
        currentMode={currentMode}
        onCloseModal={modalProps.onClosePanel}
        onCurrentModeChange={setCurrentMode}
      />
    </Modal>
  );
};

export default ModalLockGlm;
