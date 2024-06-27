import { AnimatePresence } from 'framer-motion';
import React, { ReactNode } from 'react';
// import { useTranslation } from 'react-i18next';
import { useAccount, useSignMessage } from 'wagmi';

import SettingsAddressScore from 'components/Settings/SettingsAddressScore';
import SettingsProgressPath from 'components/Settings/SettingsProgressPath';
import useDelegate from 'hooks/mutations/useDelegate';
import useSettingsStore from 'store/settings/store';

import styles from './SettingsCalculatingUQScore.module.scss';

const SettingsCalculatingUQScore = (): ReactNode => {
  const {
    delegationPrimaryAddress,
    delegationSecondaryAddress,
    calculatingUQScoreMode,
    setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationInProgress,
  } = useSettingsStore(state => ({
    calculatingUQScoreMode: state.data.calculatingUQScoreMode,
    delegationPrimaryAddress: state.data.delegationPrimaryAddress,
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    setIsDelegationCalculatingUQScoreModalOpen: state.setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationInProgress: state.setIsDelegationInProgress,
  }));
  // const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { address } = useAccount();
  const {
    data: secondaryAddressSignature,
    signMessageAsync: signSecondaryAddressMessage,
    // isPending: isSigningSecondaryAddressMessage,
    isSuccess: isSecondaryAddressMessageSigned,
  } = useSignMessage();

  const {
    data: primaryAddressSignature,
    signMessageAsync: signPrimaryAddressMessage,
    // isPending: isSigningPrimaryAddressMessage,
    isSuccess: isPrimaryAddressMessageSigned,
  } = useSignMessage();

  const { mutateAsync: delegate } = useDelegate();

  const messageToSign = `Delegation of UQ score from ${delegationSecondaryAddress} to ${delegationPrimaryAddress}`;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <SettingsAddressScore
        key="address-score-1"
        address={delegationPrimaryAddress ?? ''}
        badge="primary"
        className={styles.primaryAddress}
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
            });
          });
        }}
        score={22}
      />
      <SettingsAddressScore
        key="address-score-2"
        address={delegationSecondaryAddress ?? ''}
        areBottomCornersRounded={calculatingUQScoreMode === 'sign'}
        badge="secondary"
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
            });
          });
        }}
        score={0}
      />
      {calculatingUQScoreMode === 'score' && (
        <SettingsProgressPath key="progress-path" lastDoneStep={null} />
      )}
    </AnimatePresence>
  );
};

export default SettingsCalculatingUQScore;
