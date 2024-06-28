import { AnimatePresence } from 'framer-motion';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import BoxRounded from 'components/ui/BoxRounded';
import Svg from 'components/ui/Svg';
import useDelegate from 'hooks/mutations/useDelegate';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useSettingsStore from 'store/settings/store';
import { notificationIconWarning } from 'svg/misc';

import styles from './SettingsCalculatingUQScore.module.scss';

const SettingsCalculatingUQScore = (): ReactNode => {
  const {
    delegationPrimaryAddress,
    delegationSecondaryAddress,
    calculatingUQScoreMode,
    setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationInProgress,
    setCalculatingUQScoreMode,
    setIsDelegationCompleted,
  } = useSettingsStore(state => ({
    calculatingUQScoreMode: state.data.calculatingUQScoreMode,
    delegationPrimaryAddress: state.data.delegationPrimaryAddress,
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    setCalculatingUQScoreMode: state.setCalculatingUQScoreMode,
    setIsDelegationCalculatingUQScoreModalOpen: state.setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationCompleted: state.setIsDelegationCompleted,
    setIsDelegationInProgress: state.setIsDelegationInProgress,
  }));
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { address } = useAccount();
  const {
    data: secondaryAddressSignature,
    signMessageAsync: signSecondaryAddressMessage,
    // isPending: isSigningSecondaryAddressMessage,
    isSuccess: isSecondaryAddressMessageSigned,
  } = useSignMessage();

  const { data: secondaryAddressAntisybilStatusScore } = useAntisybilStatusScore();

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
        setTimeout(() => {
          if (secondaryAddressAntisybilStatusScore < 15) {
            return;
          }

          setCalculatingUQScoreMode('sign');
        }, 2500);
      }, 2500);
    }, 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryAddressAntisybilStatusScore]);

  const {
    data: primaryAddressSignature,
    signMessageAsync: signPrimaryAddressMessage,
    // isPending: isSigningPrimaryAddressMessage,
    isSuccess: isPrimaryAddressMessageSigned,
  } = useSignMessage();

  const { mutateAsync: delegate } = useDelegate();

  const messageToSign = `Delegation of UQ score from ${delegationSecondaryAddress} to ${delegationPrimaryAddress}`;

  const isScoreHighlighted = !!(lastDoneStep && lastDoneStep >= 1);
  const showLowScoreInfo =
    isScoreHighlighted &&
    secondaryAddressAntisybilStatusScore !== undefined &&
    secondaryAddressAntisybilStatusScore < 15;

  const scoreHighlight = useMemo(() => {
    if (!isScoreHighlighted || secondaryAddressAntisybilStatusScore === undefined) {return undefined;}
    if (secondaryAddressAntisybilStatusScore < 15) {return 'red';}
    return 'black';
  }, [isScoreHighlighted, secondaryAddressAntisybilStatusScore]);

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
        score={22}
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
        score={0}
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
