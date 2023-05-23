import loadable from '@loadable/component';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import { CurrentMode } from 'components/dedicated/GlmLock/types';

import ModalGlmLockProps from './types';

const GlmLock = loadable(() => import('components/dedicated/GlmLock/GlmLock'));

const ModalGlmLock: FC<ModalGlmLockProps> = ({ modalProps }) => {
  const { i18n } = useTranslation();
  const [currentMode, setCurrentMode] = useState<CurrentMode>('lock');

  return (
    <Modal
      header={
        currentMode === 'lock'
          ? i18n.t('common.lockGlm')
          : i18n.t('components.dedicated.modalGlmLock.unlockGLM')
      }
      {...modalProps}
    >
      <GlmLock currentMode={currentMode} onCurrentModeChange={setCurrentMode} />
    </Modal>
  );
};

export default ModalGlmLock;
