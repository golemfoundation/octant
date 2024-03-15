import cx from 'classnames';
import React, { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import InputCheckbox from 'components/ui/InputCheckbox';
import Loader from 'components/ui/Loader';
import { TERMS_OF_USE } from 'constants/urls';
import useUserAcceptsTOS from 'hooks/mutations/useUserAcceptsTOS';
import useUserTOS from 'hooks/queries/useUserTOS';

import styles from './ModalOnboardingTOS.module.scss';

const isWaitingForWalletConfirmationMultisig = false;

const ModalOnboardingTOS: FC = () => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'views.onboarding.stepsCommon.usingTheApp',
  });
  const { data: isUserTOSAccepted } = useUserTOS();
  const { mutateAsync } = useUserAcceptsTOS();

  const [isTOSChecked, setIsTOSChecked] = useState(isUserTOSAccepted);

  const handleCheckbox = e => {
    if (!e.target.checked) {
      return;
    }
    setIsTOSChecked(e.target.checked);
    mutateAsync(null);
  };

  return (
    <BoxRounded className={styles.box} dataTest="ModalOnboardingTOS" hasPadding={false} isGrey>
      {isWaitingForWalletConfirmationMultisig ? (
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
          isWaitingForWalletConfirmationMultisig && styles.isWaitingForWalletConfirmationMultisig,
        )}
        htmlFor="tos-input"
      >
        <Trans
          components={[<Button className={styles.link} href={TERMS_OF_USE} variant="link3" />]}
          i18nKey="components.dedicated.tos.text"
        />
      </label>
      {isWaitingForWalletConfirmationMultisig && (
        <div className={styles.waitingForWalletConfirmation}>
          {t('waitingForWalletConfirmation')}
        </div>
      )}
    </BoxRounded>
  );
};

export default ModalOnboardingTOS;
