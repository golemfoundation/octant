import loadable from '@loadable/component';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import { CurrentMode } from 'components/dedicated/GlmLock/types';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import ModalGlmLockProps from './types';

const GlmLock = loadable(() => import('components/dedicated/GlmLock/GlmLock'));

const ModalGlmLock: FC<ModalGlmLockProps> = ({ modalProps }) => {
  const { t, i18n } = useTranslation('translation', {
    keyPrefix: 'components.dedicated.modalGlmLock',
  });
  const { isDesktop } = useMediaQuery();
  const [currentMode, setCurrentMode] = useState<CurrentMode>('lock');
  const [isCryptoOrFiatInputFocused, setIsCryptoOrFiatInputFocused] = useState(false);

  const showBudgetBox = isDesktop || (!isDesktop && !isCryptoOrFiatInputFocused);
  const modalHeader = currentMode === 'lock' ? i18n.t('common.lockGlm') : t('unlockGLM');

  return (
    <Modal
      header={showBudgetBox ? modalHeader : undefined}
      showCloseButton={showBudgetBox}
      {...modalProps}
    >
      <GlmLock
        currentMode={currentMode}
        onChangeCryptoOrFiatInputFocus={setIsCryptoOrFiatInputFocused}
        onCloseModal={modalProps.onClosePanel}
        onCurrentModeChange={setCurrentMode}
        showBudgetBox={showBudgetBox}
      />
    </Modal>
  );
};

export default ModalGlmLock;
