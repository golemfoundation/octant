import React, { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import Modal from 'components/ui/Modal';
import ProgressStepperSlim from 'components/ui/ProgressStepperSlim';
import Text from 'components/ui/Text';
import { DISCORD_LINK } from 'constants/urls';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './ModalSettingsCalculatingYourUniqueness.module.scss';
import ModalSettingsCalculatingYourUniquenessProps from './types';

const ModalSettingsCalculatingYourUniqueness: FC<ModalSettingsCalculatingYourUniquenessProps> = ({
  modalProps,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isDesktop } = useMediaQuery();
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const steps = [
    <Trans
      className={styles.onboardingModalText}
      i18nKey="views.settings.calculatingYourUniquenessStep1"
      // TODO: add "Gitcoin Passport" href
      components={[<Button className={styles.link} href="https://google.com" variant="link3" />]}
    />,
    <Trans
      className={styles.onboardingModalText}
      i18nKey="views.settings.calculatingYourUniquenessStep2"
    />,
    <Trans
      className={styles.onboardingModalText}
      components={[
        <Button className={styles.link} href={DISCORD_LINK} variant="link3" />,
        // TODO: "scoring 20 for humans"
        <Button className={styles.link} href="https://google.com" variant="link3" />,
      ]}
      i18nKey="views.settings.calculatingYourUniquenessStep3"
    />,
  ];

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchDown = e.touches[0].clientX;

    setTouchStart(touchDown);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart) {
      return;
    }

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    const touchMoveXDiff = 5;

    const canChangeToNextStep = diff >= touchMoveXDiff && currentStep !== steps.length - 1;
    const canChangeToPrevStep = diff <= -touchMoveXDiff && currentStep > 0;

    if (canChangeToNextStep) {
      setCurrentStep(prev => prev + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStep(prev => prev - 1);
    }

    setTouchStart(null);
  };

  const handleModalEdgeClick: React.MouseEventHandler<HTMLDivElement> = e => {
    const offsetParent = (e.target as HTMLDivElement).offsetParent as HTMLElement;
    const offsetLeftParent = offsetParent.offsetLeft;
    const onboardingModalWidth = isDesktop
      ? (e.target as HTMLDivElement).offsetParent!.clientWidth!
      : window.innerWidth;
    const { clientX } = e;

    const clickDiff = 25;

    const isLeftEdgeClick = clientX - offsetLeftParent <= clickDiff;
    const isRightEdgeClick =
      Math.abs(clientX - offsetLeftParent - onboardingModalWidth) <= clickDiff;

    const canChangeToPrevStep = isLeftEdgeClick && currentStep > 0;
    const canChangeToNextStep = isRightEdgeClick && currentStep !== steps.length - 1;

    if (canChangeToNextStep) {
      setCurrentStep(prev => prev + 1);
    }

    if (canChangeToPrevStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  useEffect(() => {
    const listener = ({ key }: KeyboardEvent) => {
      if (key === 'ArrowRight' && currentStep !== steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }

      if (key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

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
        setCurrentStep(0);
      }}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <Text className={styles.text}>{steps[currentStep]}</Text>
      <ProgressStepperSlim
        className={styles.stepper}
        currentStepIndex={currentStep}
        dataTest="ModalSettingsCalculatingYourUniqueness__ProgressStepperSlim"
        numberOfSteps={steps.length}
        onStepClick={stepIndex => {
          if (stepIndex === currentStep && stepIndex !== steps.length - 1) {
            setCurrentStep(stepIndex + 1);
            return;
          }
          setCurrentStep(stepIndex);
        }}
      />
    </Modal>
  );
};

export default ModalSettingsCalculatingYourUniqueness;
