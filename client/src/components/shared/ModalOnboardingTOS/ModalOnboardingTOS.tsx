import cx from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { SignatureOpType, apiGetPendingMultisigSignatures } from 'api/calls/multisigSignatures';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import InputCheckbox from 'components/ui/InputCheckbox';
import Loader from 'components/ui/Loader';
import { TERMS_OF_USE } from 'constants/urls';
import useUserAcceptsTOS from 'hooks/mutations/useUserAcceptsTOS';
import useIsContract from 'hooks/queries/useIsContract';
import useUserTOS from 'hooks/queries/useUserTOS';

import styles from './ModalOnboardingTOS.module.scss';

const ModalOnboardingTOS: FC = () => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'views.onboarding.stepsCommon.usingTheApp',
  });
  const { address } = useAccount();
  const { data: isContract } = useIsContract();
  const { data: isUserTOSAccepted, refetch: refetchUserTOS } = useUserTOS();
  const [showInitialSignatureRequest, setShowInitialSignatureRequest] = useState(false);
  const [isWaitingForWalletConfirmationMultisig, setIsWaitingForWalletConfirmationMultisig] =
    useState(false);
  const { mutateAsync: acceptTOSMutateAsync } = useUserAcceptsTOS(() => {
    setShowInitialSignatureRequest(false);
    setIsWaitingForWalletConfirmationMultisig(true);
  });

  const [isTOSChecked, setIsTOSChecked] = useState(isUserTOSAccepted);

  const handleCheckbox = e => {
    if (!e.target.checked) {
      return;
    }

    setShowInitialSignatureRequest(true);
    setIsTOSChecked(e.target.checked);
    acceptTOSMutateAsync(null);
  };

  useEffect(() => {
    if (!address || !isContract || isUserTOSAccepted) {
      return;
    }

    const getPendingMultisigSignatures = () => {
      apiGetPendingMultisigSignatures(address!, SignatureOpType.TOS).then(data => {
        setIsWaitingForWalletConfirmationMultisig(!!data.hash);
        refetchUserTOS();
      });
    };

    getPendingMultisigSignatures();

    const intervalId = setInterval(getPendingMultisigSignatures, 2500);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isContract, isUserTOSAccepted]);

  return (
    <BoxRounded className={styles.box} dataTest="ModalOnboardingTOS" hasPadding={false} isGrey>
      {isWaitingForWalletConfirmationMultisig || showInitialSignatureRequest ? (
        <Loader />
      ) : (
        <InputCheckbox
          dataTest="TOS_InputCheckbox"
          inputId="tos-input"
          isChecked={isTOSChecked}
          onChange={handleCheckbox}
        />
      )}
      <label
        className={cx(
          styles.text,
          showInitialSignatureRequest ||
            (isWaitingForWalletConfirmationMultisig &&
              styles.isWaitingForWalletConfirmationMultisig),
        )}
        htmlFor="tos-input"
      >
        <Trans
          components={[<Button className={styles.link} href={TERMS_OF_USE} variant="link3" />]}
          i18nKey="components.dedicated.tos.text"
        />
      </label>
      {showInitialSignatureRequest && (
        <div className={styles.initialSignatureMessage}>
          <div className={styles.text}>{t('multisigSignature')}</div>
          <div className={styles.text}>{i18n.t('common.dontCloseTab')}</div>
        </div>
      )}
      {isWaitingForWalletConfirmationMultisig && (
        <div className={styles.waitingForWalletConfirmation}>
          {t('waitingForWalletConfirmation')}
        </div>
      )}
    </BoxRounded>
  );
};

export default ModalOnboardingTOS;
