import React, { useState, useEffect, useCallback, FC } from 'react';

import Img from 'components/core/Img/Img';
import Modal from 'components/core/Modal/Modal';
import ProgressStepperSlim from 'components/core/ProgressStepperSlim/ProgressStepperSlim';
import MainLayoutContainer from 'layouts/MainLayout/MainLayoutContainer';

import styles from './OnboardingView.module.scss';
import steps from './steps';
import { OnboardingViewProps } from './types';

const OnboardingView: FC<OnboardingViewProps> = ({ setIsOnboardingDone }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = steps[currentStepIndex];

  const onOnboardingExit = useCallback(() => {
    setIsOnboardingDone(true);
  }, [setIsOnboardingDone]);

  useEffect(() => {
    if (currentStepIndex === steps.length) {
      onOnboardingExit();
    }
  }, [currentStepIndex, onOnboardingExit]);

  if (currentStepIndex === steps.length) {
    return <div />;
  }

  return (
    <MainLayoutContainer isNavigationVisible={false}>
      <Modal
        header={currentStep.header}
        isOpen
        isOverflowEnabled={false}
        onClick={() =>
          currentStepIndex < steps.length ? setCurrentStepIndex(currentStepIndex + 1) : () => {}
        }
        onClosePanel={onOnboardingExit}
      >
        <div className={styles.text}>{currentStep.text}</div>
        <div className={styles.imageWrapper}>
          <Img className={styles.image} src={currentStep.image} />
          <ProgressStepperSlim
            className={styles.progressBar}
            currentStepIndex={currentStepIndex}
            numberOfSteps={steps.length}
          />
        </div>
      </Modal>
    </MainLayoutContainer>
  );
};

export default OnboardingView;
