import { AnimatePresence } from 'framer-motion';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import BoxRounded from 'components/ui/BoxRounded';
import Svg from 'components/ui/Svg';
import { DELEGATION_MIN_SCORE } from 'constants/delegation';
import useDelegate from 'hooks/mutations/useDelegate';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import useSettingsStore from 'store/settings/store';
import { notificationIconWarning } from 'svg/misc';

import styles from './SettingsCalculatingUQScore.module.scss';
import SettingsCalculatingUQScoreProps from './types';

const SettingsCalculatingUQScore: FC<SettingsCalculatingUQScoreProps> = ({
  setShowCloseButton,
}) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
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
  } = useSettingsStore(state => ({
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
    secondaryAddressAntisybilStatusScore < DELEGATION_MIN_SCORE;

  const scoreHighlight = useMemo(() => {
    if (!isScoreHighlighted || secondaryAddressAntisybilStatusScore === undefined) {
      return undefined;
    }
    if (secondaryAddressAntisybilStatusScore < DELEGATION_MIN_SCORE) {
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
      }).then(() => {
        setIsDelegationInProgress(false);
        setIsDelegationCalculatingUQScoreModalOpen(false);
        setIsDelegationCompleted(true);
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
        if (secondaryAddressAntisybilStatusScore < DELEGATION_MIN_SCORE) {
          setShowCloseButton(true);
          setIsDelegationInProgress(false);
          return;
        }
        setSecondaryAddressScore(secondaryAddressAntisybilStatusScore);
        setCalculatingUQScoreMode('sign');
      }, 2500);
    }, 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryAddressAntisybilStatusScore]);

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <SettingsAddressScore
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
      <SettingsAddressScore
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
        score={secondaryAddressAntisybilStatusScore ?? 0}
        scoreHighlight={scoreHighlight}
        showActiveDot={calculatingUQScoreMode === 'sign'}
      />
      {calculatingUQScoreMode === 'score' && (
        <SettingsProgressPath key="progress-path" lastDoneStep={lastDoneStep} />
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

export default SettingsCalculatingUQScore;
