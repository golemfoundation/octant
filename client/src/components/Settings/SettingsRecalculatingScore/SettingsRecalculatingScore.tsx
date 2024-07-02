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

const SettingsRecalculatingScore: FC<SettingsRecalculatingScoreProps> = ({ onLastStepDone }) => {
  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);
  const { data: currentEpoch } = useCurrentEpoch();

  const { address } = useAccount();

  const {
    setPrimaryAddressScore,
    setSecondaryAddressScore,
    isDelegationCompleted,
    delegationSecondaryAddress,
  } = useSettingsStore(state => ({
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    isDelegationCompleted: state.data.isDelegationCompleted,
    setPrimaryAddressScore: state.setPrimaryAddressScore,
    setSecondaryAddressScore: state.setSecondaryAddressScore,
  }));

  const { mutateAsync: refreshAntisybilStatus, isSuccess: isSuccessRefreshAntisybilStatus } =
    useRefreshAntisybilStatus(isDelegationCompleted ? delegationSecondaryAddress! : address!);

  const { data: antisybilStatusScore, isSuccess: isSuccessAntisybilStatusScore } =
    useAntisybilStatusScore(isDelegationCompleted ? delegationSecondaryAddress! : address!, {
      enabled: isSuccessRefreshAntisybilStatus,
    });
  const { data: uqScore, isSuccess: isSuccessUqScore } = useUqScore(currentEpoch!, {
    enabled: isSuccessAntisybilStatusScore,
  });

  const calculatedUqScore = useMemo(() => {
    if (antisybilStatusScore === undefined || uqScore === undefined || !lastDoneStep) {
      return 0;
    }
    if (!isDelegationCompleted && antisybilStatusScore < 20 && uqScore === 100n) {
      return 20;
    }
    return antisybilStatusScore;
  }, [antisybilStatusScore, uqScore, lastDoneStep, isDelegationCompleted]);

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

    if (isDelegationCompleted) {
      setSecondaryAddressScore(calculatedUqScore);
      return;
    }

    setPrimaryAddressScore(calculatedUqScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [antisybilStatusScore, uqScore, calculatedUqScore, isDelegationCompleted]);

  useEffect(() => {
    refreshAntisybilStatus('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SettingsAddressScore
        address={isDelegationCompleted ? delegationSecondaryAddress! : address!}
        areBottomCornersRounded={false}
        badge={isDelegationCompleted ? 'secondary' : 'primary'}
        mode="score"
        score={calculatedUqScore}
        scoreHighlight={scoreHighlight}
      />
      <SettingsProgressPath lastDoneStep={lastDoneStep} />
    </>
  );
};

export default SettingsRecalculatingScore;
