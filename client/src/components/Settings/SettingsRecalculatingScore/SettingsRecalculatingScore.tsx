import React, { FC, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import { DELEGATION_MIN_SCORE } from 'constants/delegation';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useUqScore from 'hooks/queries/useUqScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import useSettingsStore from 'store/settings/store';

import SettingsRecalculatingScoreProps from './types';

const SettingsRecalculatingScore: FC<SettingsRecalculatingScoreProps> = ({ onLastStepDone }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { address } = useAccount();
  const { data: isUserTOSAccepted } = useUserTOS();

  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);

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
    useRefreshAntisybilStatus();

  const { data: antisybilStatusScore, isSuccess: isSuccessAntisybilStatusScore } =
    useAntisybilStatusScore(isDelegationCompleted ? delegationSecondaryAddress! : address!, {
      enabled: isSuccessRefreshAntisybilStatus,
    });
  const { data: isDecisionWindowOpen } = useIsDecisionWindowOpen();

  const {
    data: uqScore,
    isFetching: isFetchingUqScore,
    isError: isErrorUqScore,
  } = useUqScore(isDecisionWindowOpen ? currentEpoch! - 1 : currentEpoch!, {
    enabled: isSuccessAntisybilStatusScore,
  });

  const calculatedUqScore = useMemo(() => {
    if (
      antisybilStatusScore === undefined ||
      (uqScore === undefined && !isErrorUqScore) ||
      !lastDoneStep
    ) {
      return 0;
    }
    if (!isDelegationCompleted && antisybilStatusScore < DELEGATION_MIN_SCORE && uqScore === 100n) {
      return DELEGATION_MIN_SCORE;
    }
    return antisybilStatusScore;
  }, [antisybilStatusScore, uqScore, lastDoneStep, isDelegationCompleted, isErrorUqScore]);

  const scoreHighlight = lastDoneStep && lastDoneStep >= 1 ? 'black' : undefined;

  useEffect(() => {
    if (!isSuccessAntisybilStatusScore) {
      return;
    }
    setLastDoneStep(0);
  }, [isSuccessAntisybilStatusScore]);

  useEffect(() => {
    if (lastDoneStep !== 0 || isFetchingUqScore) {
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
  }, [lastDoneStep, isFetchingUqScore]);

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
    if (!isUserTOSAccepted) {
      return;
    }
    refreshAntisybilStatus(isDelegationCompleted ? delegationSecondaryAddress! : address!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserTOSAccepted]);

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
