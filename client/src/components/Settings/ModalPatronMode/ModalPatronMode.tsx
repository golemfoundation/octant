import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from 'components/core/Modal/Modal';
import PatronMode from 'components/Settings/ModalPatronMode/PatronMode/PatronMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';

import styles from './ModalPatronMode.module.scss';
import ModalPatronModeProps from './types';

const ModalPatronMode: FC<ModalPatronModeProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'components.settings.patronMode' });
  const { data: isPatronMode } = useIsPatronMode();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isPatronModeEnabled = useMemo(() => isPatronMode, [modalProps.isOpen]);

  return (
    <Modal
      dataTest="ModalPatronMode"
      header={isPatronModeEnabled ? t('disablePatronMode') : t('enablePatronMode')}
      {...modalProps}
      className={styles.root}
    >
      <PatronMode onPatronModeStatusChange={modalProps.onClosePanel} />
    </Modal>
  );
};

export default ModalPatronMode;
