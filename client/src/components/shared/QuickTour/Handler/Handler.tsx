import React, { ReactElement, useEffect, useState } from 'react';
import Joyride, { EVENTS, ACTIONS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

import StepContent from 'components/shared/QuickTour/StepContent';
import TooltipComponent from 'components/shared/QuickTour/TooltipComponent';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useQuickTourSteps from 'hooks/helpers/useQuickTourSteps';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import useSettingsStore from 'store/settings/store';

const Handler = (): ReactElement => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const location = useLocation();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const { isQuickTourVisible, setIsQuickTourVisible } = useSettingsStore(state => ({
    isQuickTourVisible: state.data.isQuickTourVisible,
    setIsQuickTourVisible: state.setIsQuickTourVisible,
  }));

  const steps = useQuickTourSteps();

  useEffect(() => {
    setTimeout(() => {
      setIsRunning(true);
    }, 1000);
  }, [location.pathname]);

  if (isProjectAdminMode || isPatronMode || !isQuickTourVisible) {
    return <div />;
  }

  const stepsCurrentView = steps.map(({ content, ...rest }) => ({
    content: <StepContent {...content} />,
    ...rest,
  }));

  return (
    <div>
      <Joyride
        callback={args => {
          // When skipped on step 0, set the setting to false.
          if (currentStep === 0 && args.action === ACTIONS.SKIP && args.type === EVENTS.TOUR_END) {
            setIsQuickTourVisible(false);
          }

          // When tour is finished, set the setting to false.
          if (args.action === ACTIONS.NEXT && args.type === EVENTS.TOUR_END) {
            setIsQuickTourVisible(false);
          }

          if (args.action === ACTIONS.PREV && args.type === EVENTS.STEP_AFTER) {
            setCurrentStep(prev => prev - 1);
          }

          if (args.action === ACTIONS.NEXT && args.type === EVENTS.STEP_AFTER) {
            setCurrentStep(prev => prev + 1);
          }

          if (args.type === EVENTS.STEP_AFTER && args.step?.data?.onAfterStepIsDone) {
            setIsRunning(false);
            args.step.data.onAfterStepIsDone();
          }
        }}
        continuous
        debug
        run={isRunning}
        // 80 for LayoutTopBar + 20.
        scrollOffset={100}
        stepIndex={currentStep}
        steps={stepsCurrentView}
        // eslint-disable-next-line react/no-unstable-nested-components
        tooltipComponent={props => (
          <TooltipComponent numberOfSteps={stepsCurrentView.length} {...props} />
        )}
      />
    </div>
  );
};

export default Handler;
