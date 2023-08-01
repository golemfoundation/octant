import loadable from '@loadable/component';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import { CurrentMode } from 'components/dedicated/GlmLock/types';

import ModalGlmLockProps from './types';

const GlmLock = loadable(() => import('components/dedicated/GlmLock/GlmLock'));

const ModalGlmLock: FC<ModalGlmLockProps> = ({ modalProps }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalGlmLock',
  });
  const [currentMode, setCurrentMode] = useState<CurrentMode>('lock');

  const modalHeader = currentMode === 'lock' ? i18n.t('common.lockGlm') : t('unlockGLM');

  return (
    <Modal header={modalHeader} {...modalProps}>
      <GlmLock
        currentMode={currentMode}
        onCloseModal={modalProps.onClosePanel}
        onCurrentModeChange={setCurrentMode}
      />
    </Modal>
  );
};

export default ModalGlmLock;
