import React, { ReactElement, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button/Button';
import Img from 'components/ui/Img';
import InputCheckbox from 'components/ui/InputCheckbox';
import Modal from 'components/ui/Modal';
import { SYBIL_ATTACK_EXPLANATION, TIME_OUT_LIST_DISPUTE_FORM } from 'constants/urls';
import useDelegationStore from 'store/delegation/store';

import styles from './ModalTimeoutListPresence.module.scss';

const ModalTimeoutListPresence = (): ReactElement => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.onboarding.modalTimeoutListPresence',
  });
  const { address } = useAccount();

  const [isChecked, setIsChecked] = useState(false);

  const { setIsTimeoutListPresenceModalOpen, isTimeoutListPresenceModalOpen } = useDelegationStore(
    state => ({
      isTimeoutListPresenceModalOpen: state.data.isTimeoutListPresenceModalOpen,
      setIsTimeoutListPresenceModalOpen: state.setIsTimeoutListPresenceModalOpen,
    }),
  );

  return (
    <Modal
      bodyClassName={styles.modalBody}
      dataTest="ModalTimeoutListPresence"
      header={t('header')}
      Image={<Img className={styles.image} src="/images/sybil.webp" />}
      isOpen={!!isTimeoutListPresenceModalOpen && isTimeoutListPresenceModalOpen.value}
      isOverflowOnClickDisabled
      onClosePanel={() => {}}
      showCloseButton={false}
    >
      <div className={styles.text}>
        <Trans
          components={[
            <Button href={SYBIL_ATTACK_EXPLANATION} variant="link3" />,
            <Button href={TIME_OUT_LIST_DISPUTE_FORM} variant="link3" />,
          ]}
          i18nKey="views.onboarding.modalTimeoutListPresence.text"
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
          onClick={() => setIsTimeoutListPresenceModalOpen({ address: address!, value: false })}
          variant="cta"
        >
          {t('close')}
        </Button>
      </div>
    </Modal>
  );
};

export default ModalTimeoutListPresence;
