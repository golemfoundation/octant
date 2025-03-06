import React, { ReactElement } from 'react';
import Joyride from 'react-joyride';

import StepContent from 'components/shared/Tourguide/StepContent';
import TooltipComponent from 'components/shared/Tourguide/TooltipComponent';
import { CALENDAR, HOME_GRID_CURRENT_GLM_CLOCK } from 'constants/domElementsIds';

const Handler = (): ReactElement => {
  const steps = [
    {
      content: {
        imgSrc: '/images/tourguide/HomeGridCurrentGlmLock.gif',
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
        imgSrc: '/images/tourguide/Calendar.gif',
        text: (
          <div>
            Keep your GLM locked to earn rewards and use them in the next allocation window. The
            calendar will show you when that is, just click to open it.
          </div>
        ),
      },
      target: document.getElementById(CALENDAR),
      title: 'Test 2 title',
    },
  ].map(({ content, ...rest }) => ({
    content: <StepContent {...content} />,
    ...rest,
  }));

  // Hack around this: https://github.com/gilbarbara/react-joyride/discussions/1049.
  const areAllStepsDOMElementsLoaded = !steps.some(element => element.target === null);

  if (!areAllStepsDOMElementsLoaded) {
    return <div />;
  }

  return (
    <div>
      {areAllStepsDOMElementsLoaded && (
        <Joyride
          debug
          // @ts-expect-error unknown type collision.
          steps={steps}
          continuous
          // run
          // stepIndex={0}
          tooltipComponent={TooltipComponent}
        />
      )}
    </div>
  );
};

export default Handler;
