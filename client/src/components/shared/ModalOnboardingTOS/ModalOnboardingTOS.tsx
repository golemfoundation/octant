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

type ModalOnboardingTOSProps = {
  isWaitingForFirstMultisigSignature: boolean;
  setIsWaitingForFirstMultisigSignature: (value: boolean) => void;
};

const ModalOnboardingTOS: FC<ModalOnboardingTOSProps> = ({
  isWaitingForFirstMultisigSignature,
  setIsWaitingForFirstMultisigSignature,
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.onboarding.stepsCommon.usingTheApp',
  });
  const { address } = useAccount();
  const { data: isContract } = useIsContract();
  const { data: isUserTOSAccepted, refetch: refetchUserTOS } = useUserTOS();
  const [isWaitingForAllMultisigSignatures, setIsWaitingForAllMultisigSignatures] = useState(false);
  const { mutateAsync: acceptTOSMutateAsync } = useUserAcceptsTOS(() => {
    setIsWaitingForFirstMultisigSignature(false);
    setIsWaitingForAllMultisigSignatures(true);
  });

  const [isTOSChecked, setIsTOSChecked] = useState(isUserTOSAccepted);

  const handleCheckbox = e => {
    if (!e.target.checked) {
      return;
    }

    setIsWaitingForFirstMultisigSignature(true);
    setIsTOSChecked(e.target.checked);
    acceptTOSMutateAsync(null);
  };

  useEffect(() => {
    if (!address || !isContract || isUserTOSAccepted) {
      return;
    }

    const getPendingMultisigSignatures = () => {
      apiGetPendingMultisigSignatures(address!, SignatureOpType.TOS).then(data => {
        setIsWaitingForAllMultisigSignatures(!!data.hash);
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
      {isWaitingForAllMultisigSignatures || isWaitingForFirstMultisigSignature ? (
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
          (isWaitingForFirstMultisigSignature || isWaitingForAllMultisigSignatures) &&
            styles.isWaitingForAllMultisigSignatures,
        )}
        htmlFor="tos-input"
      >
        <Trans
          components={[<Button className={styles.link} href={TERMS_OF_USE} variant="link3" />]}
          i18nKey="components.dedicated.tos.text"
        />
      </label>
      {isWaitingForAllMultisigSignatures && (
        <div className={styles.waitingForWalletConfirmation}>
          {t('waitingForWalletConfirmation')}
        </div>
      )}
    </BoxRounded>
  );
};

export default ModalOnboardingTOS;
