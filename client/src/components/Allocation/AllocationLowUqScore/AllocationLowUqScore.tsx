import React, { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import InputCheckbox from 'components/ui/InputCheckbox';
import { GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD } from 'constants/urls';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUqScore from 'hooks/queries/useUqScore';

import styles from './AllocationLowUqScore.module.scss';
import AllocationLowUqScoreProps from './types';

const AllocationLowUqScore: FC<AllocationLowUqScoreProps> = ({ onAllocate }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.allocation.lowUQScoreModal' });
  const [isChecked, setIsChecked] = useState(false);

  const { address } = useAccount();

  const { data: currentEpoch } = useCurrentEpoch();
  const { refetch: refetchUqScore, isFetching: isFetchingUqScore } = useUqScore(currentEpoch!);
  const { mutateAsync: refreshAntisybilStatus, isPending: isPendingRefreshAntisybilStatus } =
    useRefreshAntisybilStatus();

  const windowOnFocus = () => {
    if (!address) {
      return;
    }
    refreshAntisybilStatus(address).then(() => {
      refetchUqScore();
      // And then what? Discussion in Linear.
    });
  };

  const windowOnBlur = () => setInterval(() => {});

  useEffect(() => {
    window.addEventListener('focus', windowOnFocus);
    window.addEventListener('blur', windowOnBlur);

    return () => {
      window.removeEventListener('focus', windowOnFocus);
      window.removeEventListener('blur', windowOnBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFetching = isFetchingUqScore || isPendingRefreshAntisybilStatus;

  return (
    <>
      <div className={styles.text}>
        <Trans components={[<b />]} i18nKey="views.allocation.lowUQScoreModal.text" />
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
        <Button className={styles.button} to={GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD}>
          {t('goToGitcoinPassportCustomOctantDashboard')}
        </Button>
        <Button
          className={styles.button}
          isDisabled={!isChecked || isFetching}
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
