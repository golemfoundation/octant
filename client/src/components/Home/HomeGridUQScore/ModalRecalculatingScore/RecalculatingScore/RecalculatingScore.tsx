import React, { FC, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

import AddressScore from 'components/Home/HomeGridUQScore/AddressScore';
import ProgressPath from 'components/Home/HomeGridUQScore/ProgressPath';
import { UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1 } from 'constants/uq';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUqScore from 'hooks/queries/useUqScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import useDelegationStore from 'store/delegation/store';

import RecalculatingScoreProps from './types';

const RecalculatingScore: FC<RecalculatingScoreProps> = ({ onLastStepDone }) => {
  const { data: currentEpoch } = useCurrentEpoch();
  const { address } = useAccount();
  const { data: isUserTOSAccepted } = useUserTOS();

  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);

  const {
    setPrimaryAddressScore,
    setSecondaryAddressScore,
    isDelegationCompleted,
    delegationSecondaryAddress,
  } = useDelegationStore(state => ({
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

  const {
    data: uqScore,
    isFetching: isFetchingUqScore,
    isError: isErrorUqScore,
  } = useUqScore(currentEpoch!, {
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
    if (
      !isDelegationCompleted &&
      antisybilStatusScore.score < UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1 &&
      uqScore === 100n
    ) {
      return UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1;
    }
    return antisybilStatusScore.score;
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
      <AddressScore
        address={isDelegationCompleted ? delegationSecondaryAddress! : address!}
        areBottomCornersRounded={false}
        badge={isDelegationCompleted ? 'secondary' : 'primary'}
        mode="score"
        score={calculatedUqScore}
        scoreHighlight={scoreHighlight}
      />
      <ProgressPath lastDoneStep={lastDoneStep} />
    </>
  );
};

export default RecalculatingScore;
