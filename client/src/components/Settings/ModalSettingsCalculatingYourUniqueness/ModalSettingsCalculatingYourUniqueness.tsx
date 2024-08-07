import React, { FC, memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import Modal from 'components/ui/Modal';
import ProgressStepperSlim from 'components/ui/ProgressStepperSlim';
import Text from 'components/ui/Text';
import {
  GITCOIN_PASSPORT,
  SCORING_20_FOR_HUMANS_GUIDE,
  GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD,
} from 'constants/urls';
import useModalStepperNavigation from 'hooks/helpers/useModalStepperNavigation';

import styles from './ModalSettingsCalculatingYourUniqueness.module.scss';
import ModalSettingsCalculatingYourUniquenessProps from './types';

const ModalSettingsCalculatingYourUniqueness: FC<ModalSettingsCalculatingYourUniquenessProps> = ({
  modalProps,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const steps = [
    <Trans
      components={[<Button className={styles.link} href={GITCOIN_PASSPORT} variant="link3" />]}
      i18nKey="views.settings.calculatingYourUniquenessStep1"
    />,
    <Trans
      components={[
        <Button
          className={styles.link}
          href={GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD}
          variant="link3"
        />,
      ]}
      i18nKey="views.settings.calculatingYourUniquenessStep2"
    />,
    <Trans
      components={[
        <Button className={styles.link} href={SCORING_20_FOR_HUMANS_GUIDE} variant="link3" />,
      ]}
      i18nKey="views.settings.calculatingYourUniquenessStep3"
    />,
  ];

  const {
    currentStepIndex,
    setCurrentStepIndex,
    handleModalEdgeClick,
    handleTouchMove,
    handleTouchStart,
  } = useModalStepperNavigation({ steps });

  return (
    <Modal
      className={styles.root}
      dataTest="ModalSettingsCalculatingYourUniqueness"
      header={t('calculatingYourUniqueness')}
      Image={
        <div className={styles.imageWrapper}>
          <Img className={styles.image} src="/images/calculator.webp" />
        </div>
      }
      isOpen={modalProps.isOpen}
      onClick={handleModalEdgeClick}
      onClosePanel={() => {
        modalProps.onClosePanel();
        setCurrentStepIndex(0);
      }}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <Text className={styles.text}>{steps[currentStepIndex]}</Text>
      <ProgressStepperSlim
        className={styles.stepper}
        currentStepIndex={currentStepIndex}
        dataTest="ModalSettingsCalculatingYourUniqueness__ProgressStepperSlim"
        numberOfSteps={steps.length}
        onStepClick={stepIndex => {
          if (stepIndex === currentStepIndex && stepIndex !== steps.length - 1) {
            setCurrentStepIndex(stepIndex + 1);
            return;
          }
          setCurrentStepIndex(stepIndex);
        }}
      />
    </Modal>
  );
};

export default memo(ModalSettingsCalculatingYourUniqueness);
