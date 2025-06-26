import React, { ReactElement, useState, useCallback } from 'react';
import Joyride, { EVENTS, ACTIONS, CallBackProps, TooltipRenderProps } from 'react-joyride';

import StepContent from 'components/shared/QuickTour/StepContent';
import TooltipComponent from 'components/shared/QuickTour/TooltipComponent';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useQuickTourSteps from 'hooks/helpers/useQuickTourSteps';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useOnboardingStore from 'store/onboarding/store';
import useSettingsStore from 'store/settings/store';

const Handler = (): ReactElement | null => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const { isQuickTourVisible, setIsQuickTourVisible } = useSettingsStore(state => ({
    isQuickTourVisible: state.data.isQuickTourVisible,
    setIsQuickTourVisible: state.setIsQuickTourVisible,
  }));
  const { isOnboardingModalOpen } = useOnboardingStore(state => ({
    isOnboardingModalOpen: state.data.isOnboardingModalOpen,
  }));

  const steps = useQuickTourSteps();

  const handleCallback = (args: CallBackProps) => {
    const isOnAfterStepIsDoneDefined = !!args.step?.data?.onAfterStepIsDone;
    const isOnStepPrevDefined = !!args.step?.data?.onStepPrev;

    if (currentStep === 0 && args.action === ACTIONS.SKIP && args.type === EVENTS.TOUR_END) {
      setIsQuickTourVisible(false);
    } else if (args.action === ACTIONS.PREV && args.type === EVENTS.STEP_AFTER) {
      setCurrentStep(prev => prev - 1);

      if (isOnStepPrevDefined) {
        args.step.data.onStepPrev();
      }
    } else if (args.action === ACTIONS.NEXT && args.type === EVENTS.STEP_AFTER) {
      setCurrentStep(prev => prev + 1);

      if (isOnAfterStepIsDoneDefined) {
        args.step.data.onAfterStepIsDone();
      }

      if (currentStep === steps.length - 1) {
        setIsQuickTourVisible(false);
        setCurrentStep(0);
      }
    }
  };

  const stepsCurrentView = steps.map(({ content, ...rest }) => ({
    content: <StepContent {...content} />,
    ...rest,
  }));

  const renderTooltip = useCallback(
    (props: TooltipRenderProps) => (
      <TooltipComponent numberOfSteps={stepsCurrentView.length} {...props} />
    ),
    [stepsCurrentView.length],
  );

  if (
    isProjectAdminMode ||
    isPatronMode ||
    !isQuickTourVisible ||
    isOnboardingModalOpen ||
    window.Cypress
  ) {
    return null;
  }

  return (
    <div>
      <Joyride
        callback={handleCallback}
        continuous
        run
        // 80 for LayoutTopBar + 20.
        scrollOffset={100}
        stepIndex={currentStep}
        steps={stepsCurrentView}
        tooltipComponent={renderTooltip}
      />
    </div>
  );
};

export default Handler;
