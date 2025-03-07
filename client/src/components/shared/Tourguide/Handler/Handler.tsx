import React, { ReactElement } from 'react';
import Joyride from 'react-joyride';
import { useNavigate } from 'react-router-dom';

import StepContent from 'components/shared/Tourguide/StepContent';
import TooltipComponent from 'components/shared/Tourguide/TooltipComponent';
import {
  CALENDAR,
  HOME_GRID_CURRENT_GLM_CLOCK,
  TOURGUIDE_ELEMENT_3,
  TOURGUIDE_ELEMENT_4,
  TOURGUIDE_ELEMENT_5,
  TOURGUIDE_ELEMENT_6,
} from 'constants/domElementsIds';
import useIsProjectAdminMode from 'hooks/helpers/useIsProjectAdminMode';
import useIsPatronMode from 'hooks/queries/useIsPatronMode';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';

const Handler = (): ReactElement => {
  const isProjectAdminMode = useIsProjectAdminMode();
  const { data: isPatronMode } = useIsPatronMode();
  const navigate = useNavigate();

  const steps = [
    {
      content: {
        imgSrc: '/images/tourguide/1.gif',
        text: (
          <div>
            Connect your wallet and click the <strong>Lock GLM</strong> button. Enter the amount of
            GLM to lock and confirm the transaction in your wallet.
          </div>
        ),
      },
      target: document.getElementById(HOME_GRID_CURRENT_GLM_CLOCK),
      title: 'How to lock GLM',
    },
    {
      content: {
        imgSrc: '/images/tourguide/2.gif',
        text: (
          <div>
            Keep your GLM locked to earn rewards and use them in the next allocation window. The
            calendar will show you when that is, just click to open it.
          </div>
        ),
      },
      target: document.getElementById(CALENDAR),
      title: 'Check the calendar',
    },
    {
      content: {
        imgSrc: '/images/tourguide/3.gif',
        text: (
          <div>
            When allocation is open, check Projects view and click the heart icons to add them to
            your cart. Then donate and self-allocate from here.
          </div>
        ),
      },
      target: document.getElementById(TOURGUIDE_ELEMENT_3),
      title: 'Check your cart',
    },
    {
      content: {
        imgSrc: '/images/tourguide/4.webp',
        text: (
          <div>
            You need to verify yourself as unique in order to receive fund matching for your
            donations. Visit Octant’s Gitcoin passport dashboard to do that
          </div>
        ),
      },
      target: document.getElementById(TOURGUIDE_ELEMENT_4),
      title: 'Uniqueness score',
    },
    {
      content: {
        imgSrc: '/images/tourguide/5.gif',
        text: (
          <div>
            Estimate the value of your rewards and match funding here. Just enter a GLM amount and
            the amount of time you plan to lock them for.
          </div>
        ),
      },
      target: document.getElementById(TOURGUIDE_ELEMENT_5),
      title: 'Estimate your rewards',
    },
    {
      content: {
        imgSrc: '/images/tourguide/6.gif',
        text: (
          <div>
            Mouse over the chart to see how projects are doing. Click and drag to see more. Click to
            open a project&apross details in a new tab.
          </div>
        ),
      },
      data: {
        onAfterStepIsDone: () => navigate(ROOT_ROUTES.metrics.absolute),
      },
      target: document.getElementById(TOURGUIDE_ELEMENT_6),
      title: 'Estimate your rewards',
    },
  ].map(({ content, ...rest }) => ({
    content: <StepContent {...content} />,
    ...rest,
  }));

  // Hack around this: https://github.com/gilbarbara/react-joyride/discussions/1049.
  const areAllStepsDOMElementsLoaded = !steps.some(element => element.target === null);

  if (!areAllStepsDOMElementsLoaded || isProjectAdminMode || isPatronMode) {
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
          tooltipComponent={TooltipComponent}
          continuous
          // run
          // stepIndex={0}
          debug
          // @ts-expect-error unknown type collision.
          steps={steps}
        />
      )}
    </div>
  );
};

export default Handler;
