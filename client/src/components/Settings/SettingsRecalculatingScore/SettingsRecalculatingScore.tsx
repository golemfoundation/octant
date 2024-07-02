import React, { FC, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUqScore from 'hooks/queries/useUqScore';
import useSettingsStore from 'store/settings/store';

import SettingsRecalculatingScoreProps from './types';

// TODO: add support for delegation recalculation OCT-1735 (https://linear.app/golemfoundation/issue/OCT-1735/add-support-for-delegation-recalculation)
const SettingsRecalculatingScore: FC<SettingsRecalculatingScoreProps> = ({ onLastStepDone }) => {
  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);
  const { data: currentEpoch } = useCurrentEpoch();
  const { mutateAsync: refreshAntisybilStatus, isSuccess: isSuccessRefreshAntisybilStatus } =
    useRefreshAntisybilStatus();
  const { data: antisybilStatusScore, isSuccess: isSuccessAntisybilStatusScore } =
    useAntisybilStatusScore({ enabled: isSuccessRefreshAntisybilStatus });
  const { data: uqScore, isSuccess: isSuccessUqScore } = useUqScore(currentEpoch!, {
    enabled: isSuccessAntisybilStatusScore,
  });
  const { address } = useAccount();

  const calculatedUqScore = useMemo(() => {
    if (antisybilStatusScore === undefined || uqScore === undefined || !lastDoneStep) {
      return 0;
    }
    if (antisybilStatusScore < 20 && uqScore === 100n) {
      return 20;
    }
    return antisybilStatusScore;
  }, [antisybilStatusScore, uqScore, lastDoneStep]);

  const { setPrimaryAddressScore } = useSettingsStore(state => ({
    setPrimaryAddressScore: state.setPrimaryAddressScore,
  }));

  useEffect(() => {
    if (!isSuccessAntisybilStatusScore) {
      return;
    }
    setLastDoneStep(0);
  }, [isSuccessAntisybilStatusScore]);

  useEffect(() => {
    if (lastDoneStep !== 0 || !isSuccessUqScore) {
      return;
    }
    setLastDoneStep(1);

    setTimeout(() => {
      setLastDoneStep(2);
      setTimeout(() => {
        onLastStepDone();
      }, 2500);
    }, 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastDoneStep, isSuccessUqScore]);

  const scoreHighlight = lastDoneStep && lastDoneStep >= 1 ? 'black' : undefined;

  useEffect(() => {
    if (antisybilStatusScore === undefined || uqScore === undefined) {
      return;
    }
    setPrimaryAddressScore(calculatedUqScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedUqScore]);

  useEffect(() => {
    refreshAntisybilStatus('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SettingsAddressScore
        address={address!}
        areBottomCornersRounded={false}
        badge="primary"
        mode="score"
        score={calculatedUqScore}
        scoreHighlight={scoreHighlight}
      />
      <SettingsProgressPath lastDoneStep={lastDoneStep} />
    </>
  );
};

export default SettingsRecalculatingScore;
