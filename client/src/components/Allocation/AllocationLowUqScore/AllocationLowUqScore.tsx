import React, { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import InputCheckbox from 'components/ui/InputCheckbox';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';

import styles from './AllocationLowUqScore.module.scss';
import AllocationLowUqScoreProps from './types';

const AllocationLowUqScore: FC<AllocationLowUqScoreProps> = ({ onAllocate }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.allocation.lowUQScoreModal',
  });
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className={styles.text}>
        <Trans components={[<b />]} i18nKey="components.allocation.lowUQScoreModal.text" />
      </div>
      <BoxRounded className={styles.box} hasPadding={false} isGrey>
        <InputCheckbox
          className={styles.checkbox}
          isChecked={isChecked}
          // eslint-disable-next-line  @typescript-eslint/naming-convention
          onChange={() => setIsChecked(prev => !prev)}
          size="big"
        />
        <label className={styles.checkboxLabel}>{t('checkboxLabel')}</label>
      </BoxRounded>
      <div className={styles.buttonsContainer}>
        <Button className={styles.button} onClick={() => navigate(ROOT_ROUTES.settings.absolute)}>
          {t('goToUQSettings')}
        </Button>
        <Button
          className={styles.button}
          isDisabled={!isChecked}
          onClick={onAllocate}
          variant="cta"
        >
          {t('proceedToAllocate')}
        </Button>
      </div>
    </>
  );
};

export default AllocationLowUqScore;
