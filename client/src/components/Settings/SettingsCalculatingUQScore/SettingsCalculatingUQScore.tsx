import { AnimatePresence } from 'framer-motion';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import BoxRounded from 'components/ui/BoxRounded';
import Svg from 'components/ui/Svg';
import useDelegate from 'hooks/mutations/useDelegate';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useSettingsStore from 'store/settings/store';
import { notificationIconWarning } from 'svg/misc';

import styles from './SettingsCalculatingUQScore.module.scss';
import SettingsCalculatingUQScoreProps from './types';

const SettingsCalculatingUQScore: FC<SettingsCalculatingUQScoreProps> = ({
  setShowCloseButton,
}) => {
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
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { address } = useAccount();
  const {
    data: secondaryAddressSignature,
    signMessageAsync: signSecondaryAddressMessage,
    isSuccess: isSecondaryAddressMessageSigned,
  } = useSignMessage();

  const { mutateAsync: refreshAntisybilStatus, isSuccess: isSuccessRefreshAntisybilStatus } =
    useRefreshAntisybilStatus(address!);
  const { data: secondaryAddressAntisybilStatusScore } = useAntisybilStatusScore(address!, {
    enabled: isSuccessRefreshAntisybilStatus,
  });

  const [lastDoneStep, setLastDoneStep] = useState<null | 0 | 1 | 2>(null);

  useEffect(() => {
    if (secondaryAddressAntisybilStatusScore === undefined) {
      return;
    }
    setLastDoneStep(0);
    setTimeout(() => {
      setLastDoneStep(1);
      setTimeout(() => {
        setLastDoneStep(2);
        if (secondaryAddressAntisybilStatusScore < 20) {
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

  const {
    data: primaryAddressSignature,
    signMessageAsync: signPrimaryAddressMessage,
    isSuccess: isPrimaryAddressMessageSigned,
  } = useSignMessage();

  const { mutateAsync: delegate } = useDelegate();

  const messageToSign = t('delegationMessageToSign', {
    delegationPrimaryAddress,
    delegationSecondaryAddress,
  });

  const isScoreHighlighted = !!(lastDoneStep && lastDoneStep >= 1);
  const showLowScoreInfo =
    isScoreHighlighted &&
    secondaryAddressAntisybilStatusScore !== undefined &&
    secondaryAddressAntisybilStatusScore < 20;

  const scoreHighlight = useMemo(() => {
    if (!isScoreHighlighted || secondaryAddressAntisybilStatusScore === undefined) {
      return undefined;
    }
    if (secondaryAddressAntisybilStatusScore < 20) {
      return 'red';
    }
    return 'black';
  }, [isScoreHighlighted, secondaryAddressAntisybilStatusScore]);

  useEffect(() => {
    refreshAntisybilStatus('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onSignMessage={() => {
          signPrimaryAddressMessage({ message: messageToSign }).then(data => {
            if (!secondaryAddressSignature) {
              return;
            }

            delegate({
              primaryAddress: delegationPrimaryAddress!,
              primaryAddressSignature: data,
              secondaryAddress: delegationSecondaryAddress!,
              secondaryAddressSignature,
            }).then(() => {
              setIsDelegationInProgress(false);
              setIsDelegationCalculatingUQScoreModalOpen(false);
              setIsDelegationCompleted(true);
            });
          });
        }}
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
        onSignMessage={() => {
          signSecondaryAddressMessage({ message: messageToSign }).then(data => {
            if (!primaryAddressSignature) {
              return;
            }

            delegate({
              primaryAddress: delegationPrimaryAddress!,
              primaryAddressSignature,
              secondaryAddress: delegationSecondaryAddress!,
              secondaryAddressSignature: data,
            }).then(() => {
              setIsDelegationInProgress(false);
              setIsDelegationCalculatingUQScoreModalOpen(false);
              setIsDelegationCompleted(true);
            });
          });
        }}
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
