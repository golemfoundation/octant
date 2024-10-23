import { AnimatePresence } from 'framer-motion';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';

import AddressScore from 'components/Home/HomeGridUQScore/AddressScore';
import ProgressPath from 'components/Home/HomeGridUQScore/ProgressPath';
import BoxRounded from 'components/ui/BoxRounded';
import Svg from 'components/ui/Svg';
import { UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1 } from 'constants/uq';
import useDelegate from 'hooks/mutations/useDelegate';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import toastService from 'services/toastService';
import useDelegationStore from 'store/delegation/store';
import { notificationIconWarning } from 'svg/misc';

import styles from './CalculatingUQScore.module.scss';
import CalculatingUQScoreProps from './types';

const CalculatingUQScore: FC<CalculatingUQScoreProps> = ({ setShowCloseButton }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridUQScore.modalCalculatingUQScore',
  });
  const { address } = useAccount();

  const { data: isUserTOSAccepted } = useUserTOS();
  const { mutateAsync: refreshAntisybilStatus, isSuccess: isSuccessRefreshAntisybilStatus } =
    useRefreshAntisybilStatus();

  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);

  const {
    delegationPrimaryAddress,
    delegationSecondaryAddress,
    calculatingUQScoreMode,
    primaryAddressScore,
    setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationInProgress,
    setCalculatingUQScoreMode,
    setIsDelegationCompleted,
    setSecondaryAddressScore,
  } = useDelegationStore(state => ({
    calculatingUQScoreMode: state.data.calculatingUQScoreMode,
    delegationPrimaryAddress: state.data.delegationPrimaryAddress,
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    primaryAddressScore: state.data.primaryAddressScore,
    setCalculatingUQScoreMode: state.setCalculatingUQScoreMode,
    setIsDelegationCalculatingUQScoreModalOpen: state.setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationCompleted: state.setIsDelegationCompleted,
    setIsDelegationInProgress: state.setIsDelegationInProgress,
    setSecondaryAddressScore: state.setSecondaryAddressScore,
  }));

  const { data: secondaryAddressAntisybilStatusScore } = useAntisybilStatusScore(
    delegationSecondaryAddress!,
    {
      enabled: isSuccessRefreshAntisybilStatus,
    },
  );

  const messageToSign = t('delegationMessageToSign', {
    delegationPrimaryAddress,
    delegationSecondaryAddress,
  });

  const isScoreHighlighted = !!(lastDoneStep && lastDoneStep >= 1);
  const showLowScoreInfo =
    isScoreHighlighted &&
    secondaryAddressAntisybilStatusScore !== undefined &&
    secondaryAddressAntisybilStatusScore.score < UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1;

  const scoreHighlight = useMemo(() => {
    if (!isScoreHighlighted || secondaryAddressAntisybilStatusScore === undefined) {
      return undefined;
    }
    if (secondaryAddressAntisybilStatusScore.score < UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1) {
      return 'red';
    }
    return 'black';
  }, [isScoreHighlighted, secondaryAddressAntisybilStatusScore]);

  const {
    data: primaryAddressSignature,
    signMessageAsync: signPrimaryAddressMessage,
    isSuccess: isPrimaryAddressMessageSigned,
  } = useSignMessage();
  const {
    data: secondaryAddressSignature,
    signMessageAsync: signSecondaryAddressMessage,
    isSuccess: isSecondaryAddressMessageSigned,
  } = useSignMessage();
  const { mutateAsync: delegate } = useDelegate();

  const signMessageAndDelegate = (isSecondaryAddress = false) => {
    (isSecondaryAddress
      ? signSecondaryAddressMessage({ message: messageToSign })
      : signPrimaryAddressMessage({ message: messageToSign })
    ).then(data => {
      if (isSecondaryAddress ? !primaryAddressSignature : !secondaryAddressSignature) {
        return;
      }

      delegate({
        primaryAddress: delegationPrimaryAddress!,
        primaryAddressSignature: isSecondaryAddress ? primaryAddressSignature! : data,
        secondaryAddress: delegationSecondaryAddress!,
        secondaryAddressSignature: isSecondaryAddress ? data : secondaryAddressSignature!,
      })
        .then(() => {
          setIsDelegationInProgress(false);
          setIsDelegationCalculatingUQScoreModalOpen(false);
          setIsDelegationCompleted(true);
        })
        .catch(error => {
          if (error.message === 'Secondary address cannot lock any GLMs') {
            toastService.showToast({
              message: t('toasts.unableToDelegateToAddressWithPositiveGLMLock.message'),
              name: 'unableToDelegateToAddressWithPositiveGLMLock',
              title: t('toasts.unableToDelegateToAddressWithPositiveGLMLock.title'),
              type: 'error',
            });
          }
          setIsDelegationInProgress(false);
          setIsDelegationCalculatingUQScoreModalOpen(false);
          setIsDelegationCompleted(false);
        });
    });
  };

  useEffect(() => {
    if (!isUserTOSAccepted) {
      return;
    }
    refreshAntisybilStatus(address!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserTOSAccepted]);

  useEffect(() => {
    if (secondaryAddressAntisybilStatusScore === undefined) {
      return;
    }
    setLastDoneStep(0);
    setTimeout(() => {
      setLastDoneStep(1);
      setTimeout(() => {
        setLastDoneStep(2);
        if (secondaryAddressAntisybilStatusScore.score < UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1) {
          setShowCloseButton(true);
          setIsDelegationInProgress(false);
          return;
        }
        setSecondaryAddressScore(secondaryAddressAntisybilStatusScore.score);
        setCalculatingUQScoreMode('sign');
      }, 2500);
    }, 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryAddressAntisybilStatusScore]);

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <AddressScore
        key="primary-address"
        address={delegationPrimaryAddress ?? ''}
        badge="primary"
        isMessageSigned={isPrimaryAddressMessageSigned}
        isSignMessageButtonDisabled={
          address !== delegationPrimaryAddress || isPrimaryAddressMessageSigned
        }
        mode={calculatingUQScoreMode}
        onSignMessage={signMessageAndDelegate}
        score={primaryAddressScore ?? 0}
        showActiveDot={calculatingUQScoreMode === 'sign'}
      />
      <AddressScore
        key="secondary-address"
        address={delegationSecondaryAddress ?? ''}
        areBottomCornersRounded={calculatingUQScoreMode === 'sign'}
        badge="secondary"
        className={styles.secondaryAddress}
        isMessageSigned={isSecondaryAddressMessageSigned}
        isSignMessageButtonDisabled={
          address !== delegationSecondaryAddress || isSecondaryAddressMessageSigned
        }
        mode={calculatingUQScoreMode}
        onSignMessage={() => signMessageAndDelegate(true)}
        score={secondaryAddressAntisybilStatusScore?.score ?? 0}
        scoreHighlight={scoreHighlight}
        showActiveDot={calculatingUQScoreMode === 'sign'}
      />
      {calculatingUQScoreMode === 'score' && (
        <ProgressPath key="progress-path" lastDoneStep={lastDoneStep} />
      )}
      {showLowScoreInfo && (
        <BoxRounded
          alignment="left"
          className={styles.lowScoreInfoBox}
          isGrey
          justifyContent="start"
          textAlign="left"
        >
          <Svg img={notificationIconWarning} size={3.2} />
          <div className={styles.lowScoreInfo}>{t('delegationFailedText')} </div>
        </BoxRounded>
      )}
    </AnimatePresence>
  );
};

export default CalculatingUQScore;
