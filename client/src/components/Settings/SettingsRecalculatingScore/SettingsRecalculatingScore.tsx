import React, { FC, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useSettingsStore from 'store/settings/store';

import SettingsRecalculatingScoreProps from './types';

// TODO: add support for delegation recalculation
const SettingsRecalculatingScore: FC<SettingsRecalculatingScoreProps> = ({ onLastStepDone }) => {
  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);
  const { data: antisybilStatusScore, isSuccess } = useAntisybilStatusScore();
  const { address } = useAccount();

  const { setPrimaryAddressScore } = useSettingsStore(state => ({
    setPrimaryAddressScore: state.setPrimaryAddressScore,
  }));

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

  const scoreHighlight = lastDoneStep && lastDoneStep >= 1 ? 'black' : undefined;
  const score =
    lastDoneStep && lastDoneStep >= 1 && antisybilStatusScore ? antisybilStatusScore : 0;

  useEffect(() => {
    if (antisybilStatusScore === undefined) {
      return;
    }
    setPrimaryAddressScore(antisybilStatusScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [antisybilStatusScore]);

  return (
    <>
      <SettingsAddressScore
        address={address!}
        areBottomCornersRounded={false}
        badge="primary"
        mode="score"
        score={score}
        scoreHighlight={scoreHighlight}
      />
      <SettingsProgressPath lastDoneStep={lastDoneStep} />
    </>
  );
};

export default SettingsRecalculatingScore;
