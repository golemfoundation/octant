import React, { useState, useEffect, useCallback, ReactElement } from 'react';

import Img from 'components/core/Img/Img';
import Modal from 'components/core/Modal/Modal';
import ProgressStepperSlim from 'components/core/ProgressStepperSlim/ProgressStepperSlim';
import Text from 'components/core/Text/Text';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import MainLayout from 'layouts/MainLayout/MainLayout';
import useOnboardingStore from 'store/onboarding/store';

import styles from './OnboardingView.module.scss';
import steps from './steps';
import stepsEpoch1 from './stepsEpoch1';

const OnboardingView = (): ReactElement => {
  const { setIsOnboardingDone } = useOnboardingStore(state => ({
    setIsOnboardingDone: state.setIsOnboardingDone,
  }));

  const { data: currentEpoch } = useCurrentEpoch();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const stepsToUse = currentEpoch === 1 ? stepsEpoch1 : steps;
  const currentStep = stepsToUse[currentStepIndex];

  const onOnboardingExit = useCallback(() => {
    setIsOnboardingDone(true);
  }, [setIsOnboardingDone]);

  useEffect(() => {
    if (currentStepIndex === stepsToUse.length) {
      onOnboardingExit();
    }
  }, [currentStepIndex, onOnboardingExit, stepsToUse]);

  if (currentStepIndex === stepsToUse.length) {
    return <div />;
  }

  return (
    <MainLayout dataTest="OnboardingView" isHeaderVisible={false} isNavigationVisible={false}>
      <Modal
        dataTest="OnboardingView__Modal"
        header={currentStep.header}
        Image={
          <div className={styles.onboardingModalImageWrapper}>
            <Img className={styles.onboardingModalImage} src={currentStep.image} />
          </div>
        }
        isOpen
        onClosePanel={onOnboardingExit}
      >
        <Text className={styles.onboardingModalText}>{currentStep.text}</Text>
        <ProgressStepperSlim
          className={styles.progressBar}
          currentStepIndex={currentStepIndex}
          dataTest="OnboardingView__ProgressStepperSlim"
          numberOfSteps={stepsToUse.length}
          onStepClick={stepIndex => {
            if (stepIndex === currentStepIndex) {
              setCurrentStepIndex(stepIndex + 1);
              return;
            }
            setCurrentStepIndex(stepIndex);
          }}
        />
      </Modal>
    </MainLayout>
  );
};

export default OnboardingView;
