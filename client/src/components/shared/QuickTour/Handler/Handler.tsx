import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Joyride from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';

import StepContent from 'components/shared/QuickTour/StepContent';
import TooltipComponent from 'components/shared/QuickTour/TooltipComponent';
import {
  CALENDAR,
  HOME_GRID_CURRENT_GLM_CLOCK,
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
import { StepsPerView } from './types';

const Handler = (): ReactElement => {
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

  const steps: StepsPerView = {
    [ROOT_ROUTES.home.absolute]: [
      {
        content: {
          imgSrc: '/images/tourguide/1.gif',
          text: (
            <Trans components={[<span className={styles.bold} />]} i18nKey="tourGuide.step1.text" />
          ),
        },
        target: document.getElementById(HOME_GRID_CURRENT_GLM_CLOCK),
        title: t('step1.title'),
      },
      {
        content: {
          imgSrc: '/images/tourguide/2.gif',
          text: t('step2.text'),
        },
        target: document.getElementById(CALENDAR),
        title: t('step2.title'),
      },
      {
        content: {
          imgSrc: '/images/tourguide/3.gif',
          text: t('step3.text'),
        },
        target: document.getElementById(TOURGUIDE_ELEMENT_3),
        title: t('step3.title'),
      },
      {
        content: {
          imgSrc: '/images/tourguide/4.webp',
          text: t('step4.text'),
        },
        target: document.getElementById(TOURGUIDE_ELEMENT_4),
        title: t('step4.title'),
      },
      {
        content: {
          imgSrc: '/images/tourguide/5.gif',
          text: t('step5.text'),
        },
        target: document.getElementById(TOURGUIDE_ELEMENT_5),
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
        target: document.getElementById(TOURGUIDE_ELEMENT_6),
        title: t('step6.title'),
      },
    ],
    [ROOT_ROUTES.projects.absolute]: [
      {
        content: {
          imgSrc: '/images/tourguide/7.gif',
          text: t('step7.text'),
        },
        data: {
          onAfterStepIsDone: () => navigate(ROOT_ROUTES.metrics.absolute),
        },
        target: document.getElementById(TOURGUIDE_ELEMENT_7),
        title: t('step7.title'),
      },
    ],
    [ROOT_ROUTES.metrics.absolute]: [
      {
        content: {
          imgSrc: '/images/tourguide/8.gif',
          text: t('step8.text'),
        },
        target: document.getElementById(TOURGUIDE_ELEMENT_8),
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
        target: document.getElementById(TOURGUIDE_ELEMENT_9),
        title: t('step9.title'),
      },
    ],
  };

  const stepsCurrentView = steps[location.pathname]?.map(({ content, ...rest }) => ({
    content: <StepContent {...content} />,
    ...rest,
  }));

  // Hack around this: https://github.com/gilbarbara/react-joyride/discussions/1049.
  const areAllStepsDOMElementsLoaded = !stepsCurrentView?.some(element => element.target === null);

  if (!areAllStepsDOMElementsLoaded || isProjectAdminMode || isPatronMode || !isQuickTourVisible) {
    return <div />;
  }

  return (
    <div>
      {areAllStepsDOMElementsLoaded && (
        <Joyride
          callback={args => {
            // console.log({ args }, args.action);
            if (
              args.action === 'next' &&
              args.status === 'finished' &&
              args.step?.data?.onAfterStepIsDone
            ) {
              args.step.data.onAfterStepIsDone();
            }
          }}
          continuous
          tooltipComponent={TooltipComponent}
          debug
          // @ts-expect-error unknown type collision.
          steps={stepsCurrentView}
        />
      )}
    </div>
  );
};

export default Handler;
