import React, { ReactElement, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Joyride, { EVENTS, ACTIONS } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';

import StepContent from 'components/shared/QuickTour/StepContent';
import TooltipComponent from 'components/shared/QuickTour/TooltipComponent';
import {
  CALENDAR,
  HOME_GRID_CURRENT_GLM_CLOCK,
  TOURGUIDE_ELEMENT_10_11,
  TOURGUIDE_ELEMENT_3,
  TOURGUIDE_ELEMENT_4,
  TOURGUIDE_ELEMENT_5,
  TOURGUIDE_ELEMENT_6,
  TOURGUIDE_ELEMENT_7,
  TOURGUIDE_ELEMENT_8,
  TOURGUIDE_ELEMENT_9,
} from 'constants/domElementsIds';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';
import useSettingsStore from 'store/settings/store';

import styles from './Handler.module.scss';
import { Step } from './types';

const Handler = (): ReactElement => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation('translation', {
    keyPrefix: 'tourGuide',
  });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();

  const { isQuickTourVisible } = useSettingsStore(state => ({
    isQuickTourVisible: state.data.isQuickTourVisible,
  }));

  const steps: Step[] = [
    {
      content: {
        imgSrc: '/images/tourguide/1.gif',
        text: (
          <Trans components={[<span className={styles.bold} />]} i18nKey="tourGuide.step1.text" />
        ),
      },
      target: `#${HOME_GRID_CURRENT_GLM_CLOCK}`,
      title: t('step1.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/2.gif',
        text: t('step2.text'),
      },
      target: `#${CALENDAR}`,
      title: t('step2.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/3.gif',
        text: t('step3.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_3}`,
      title: t('step3.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/4.webp',
        text: t('step4.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_4}`,
      title: t('step4.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/5.gif',
        text: t('step5.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_5}`,
      title: t('step5.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/6.gif',
        text: t('step6.text'),
      },
      data: {
        onAfterStepIsDone: () =>
          navigate(
            isDecisionWindowOpen ? ROOT_ROUTES.projects.absolute : ROOT_ROUTES.metrics.absolute,
          ),
      },
      target: `#${TOURGUIDE_ELEMENT_6}`,
      title: t('step6.title'),
    },
    ...(isDecisionWindowOpen
      ? [
          {
            content: {
              imgSrc: '/images/tourguide/7.gif',
              text: t('step7.text'),
            },
            data: {
              onAfterStepIsDone: () => navigate(ROOT_ROUTES.metrics.absolute),
            },
            target: `#${TOURGUIDE_ELEMENT_7}`,
            title: t('step7.title'),
          },
        ]
      : []),
    {
      content: {
        imgSrc: '/images/tourguide/8.gif',
        text: t('step8.text'),
      },
      target: `#${TOURGUIDE_ELEMENT_8}`,
      title: t('step8.title'),
    },
    {
      content: {
        imgSrc: '/images/tourguide/9.gif',
        text: t('step9.text'),
      },
      data: {
        // TODO: redirect OR open drawer...
        onAfterStepIsDone: () => navigate(ROOT_ROUTES.allocation.absolute),
      },
      target: `#${TOURGUIDE_ELEMENT_9}`,
      title: t('step9.title'),
    },
    ...(isDecisionWindowOpen
      ? [
          {
            content: {
              imgSrc: '/images/tourguide/10.gif',
              text: t('step10.text'),
            },
            target: `#${TOURGUIDE_ELEMENT_10_11}`,
            title: t('step10.title'),
          },
          {
            content: {
              imgSrc: '/images/tourguide/11.gif',
              text: t('step11.text'),
            },
            target: `#${TOURGUIDE_ELEMENT_10_11}`,
            title: t('step11.title'),
          },
        ]
      : []),
  ];

  useEffect(() => {
    setTimeout(() => {
      setIsRunning(true);
    }, 1000);
  }, [location.pathname]);

  const stepsCurrentView = steps.map(({ content, ...rest }) => ({
    content: <StepContent {...content} />,
    ...rest,
  }));

  // Hack around this: https://github.com/gilbarbara/react-joyride/discussions/1049.
  // const areAllStepsDOMElementsLoaded = !stepsCurrentView?.some(element => element.target === null);
  const areAllStepsDOMElementsLoaded = true;

  if (!areAllStepsDOMElementsLoaded || isProjectAdminMode || isPatronMode || !isQuickTourVisible) {
    return <div />;
  }

  return (
    <div>
      {areAllStepsDOMElementsLoaded && (
        <Joyride
          callback={args => {
            // console.log({ args }, args.action, args.type);

            if (args.action === ACTIONS.PREV && args.type === EVENTS.STEP_AFTER) {
              setCurrentStep(prev => prev - 1);
            }

            if (args.action === ACTIONS.NEXT && args.type === EVENTS.STEP_AFTER) {
              setCurrentStep(prev => prev + 1);
            }

            if (args.type === EVENTS.STEP_AFTER && args.step?.data?.onAfterStepIsDone) {
              setIsRunning(false);
              args.step.data.onAfterStepIsDone();
              // debugger;
            }
          }}
          continuous
          debug
          run={isRunning}
          stepIndex={currentStep}
          steps={stepsCurrentView}
          tooltipComponent={TooltipComponent}
        />
      )}
    </div>
  );
};

export default Handler;
