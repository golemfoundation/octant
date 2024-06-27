import React, { FC, useEffect, useState } from 'react';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';

import SettingsRecalculatingScoreProps from './types';

const SettingsRecalculatingScore: FC<SettingsRecalculatingScoreProps> = ({ onLastStepDone }) => {
  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);
  const { data: antisybilStatusScore, isSuccess } = useAntisybilStatusScore();

  useEffect(() => {
    if (!isSuccess) {
      return;
    }
    setLastDoneStep(0);
  }, [isSuccess]);

  // "Checking allowlist", "Finished" mock
  useEffect(() => {
    if (lastDoneStep === null) {
      return;
    }
    if (lastDoneStep === 2) {
      setTimeout(() => {
        onLastStepDone();
      }, 2500);
    }

    setTimeout(
      () =>
        setLastDoneStep(prev => {
          if (prev === null) {
            return 0;
          }
          if (prev === 0) {
            return 1;
          }
          return 2;
        }),
      2500,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDoneStep]);

  const isScoreHighlighted = !!(lastDoneStep && lastDoneStep >= 1);
  const score =
    lastDoneStep && lastDoneStep >= 1 && antisybilStatusScore ? antisybilStatusScore : 0;

  return (
    <>
      <SettingsAddressScore
        address="0xe5e11cc5fb894eF5A9D7Da768cFb17066b9d35D7"
        areBottomCornersRounded={false}
        badge="primary"
        isScoreHighlighted={isScoreHighlighted}
        mode="score"
        score={score}
      />
      <SettingsProgressPath lastDoneStep={lastDoneStep} />
    </>
  );
};

export default SettingsRecalculatingScore;
