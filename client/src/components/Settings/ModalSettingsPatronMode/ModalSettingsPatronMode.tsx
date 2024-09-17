import React, { FC, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import SettingsPatronMode from 'components/Settings/SettingsPatronMode';
import Modal from 'components/ui/Modal';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './ModalSettingsPatronMode.module.scss';
import ModalSettingsPatronModeProps from './types';

const ModalSettingsPatronMode: FC<ModalSettingsPatronModeProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.settings.patronMode' });
  const { data: isPatronMode } = useIsPatronMode();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isPatronModeEnabled = useMemo(() => isPatronMode, [modalProps.isOpen]);

  return createPortal(
    <Modal
      dataTest="ModalPatronMode"
      header={isPatronModeEnabled ? t('disablePatronMode') : t('enablePatronMode')}
      {...modalProps}
      className={styles.root}
    >
      <SettingsPatronMode onPatronModeStatusChange={modalProps.onClosePanel} />
    </Modal>,
    document.body,
  );
};

export default ModalSettingsPatronMode;
