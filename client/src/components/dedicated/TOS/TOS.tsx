import React, { FC, useState } from 'react';
import { Trans } from 'react-i18next';

import BoxRounded from 'components/core/BoxRounded/BoxRounded';
import Button from 'components/core/Button/Button';
import InputCheckbox from 'components/core/InputCheckbox/InputCheckbox';
import { TERMS_OF_USE } from 'constants/urls';
import useUserAcceptsTOS from 'hooks/mutations/useUserAcceptsTOS';
import useUserTOS from 'hooks/queries/useUserTOS';

import styles from './TOS.module.scss';

const TOS: FC = () => {
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
    <BoxRounded className={styles.box} hasPadding={false} isGrey>
      <InputCheckbox
        dataTest="TOS_InputCheckbox"
        inputId="tos-input"
        isChecked={isTOSChecked}
        onChange={handleCheckbox}
      />
      <label className={styles.text} htmlFor="tos-input">
        <Trans
          components={[<Button className={styles.link} href={TERMS_OF_USE} variant="link3" />]}
          i18nKey="components.dedicated.tos.text"
        />
      </label>
    </BoxRounded>
  );
};

export default TOS;
