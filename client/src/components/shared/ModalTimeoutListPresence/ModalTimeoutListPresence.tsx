import React, { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button/Button';
import Img from 'components/ui/Img';
import InputCheckbox from 'components/ui/InputCheckbox';
import Modal from 'components/ui/Modal';
import { TIME_OUT_LIST_DISPUTE_FORM } from 'constants/urls';

import styles from './ModalTimeoutListPresence.module.scss';
import ModalTimeoutListPresenceProps from './types';

const ModalTimeoutListPresence: FC<ModalTimeoutListPresenceProps> = ({ modalProps }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.onboarding.suspectedSybilModal',
  });

  const [isChecked, setIsChecked] = useState(false);

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalSuspectedSybil"
      header={t('header')}
      Image={<Img className={styles.image} src="/images/sybil.webp" />}
      isOverflowOnClickDisabled
      showCloseButton={false}
      {...modalProps}
      isOpen
    >
      <div className={styles.text}>
        <Trans
          components={[
            <Button variant="link3" />,
            <Button href={TIME_OUT_LIST_DISPUTE_FORM} variant="link3" />,
          ]}
          i18nKey="views.onboarding.suspectedSybilModal.text"
        />
      </div>
      <BoxRounded className={styles.box} hasPadding={false} isGrey>
        <InputCheckbox
          className={styles.checkbox}
          isChecked={isChecked}
          // eslint-disable-next-line  @typescript-eslint/naming-convention
          onChange={() => setIsChecked(prev => !prev)}
          size="big"
        />
        <label className={styles.checkboxLabel}>{t('checkboxLabel')}</label>
      </BoxRounded>
      <div className={styles.buttonsContainer}>
        <Button className={styles.button} href={TIME_OUT_LIST_DISPUTE_FORM} target="_blank">
          {t('goToDisputeForm')}
        </Button>
        <Button
          className={styles.button}
          isDisabled={!isChecked}
          onClick={modalProps.onClosePanel}
          variant="cta"
        >
          {t('close')}
        </Button>
      </div>
    </Modal>
  );
};

export default ModalTimeoutListPresence;
