import React, { FC, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import InputCheckbox from 'components/ui/InputCheckbox';
import { PASSPORT_XYZ_CUSTOM_OCTANT_DASHBOARD } from 'constants/urls';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUqScore from 'hooks/queries/useUqScore';
import toastService from 'services/toastService';

import styles from './AllocationLowUqScore.module.scss';
import AllocationLowUqScoreProps from './types';

const AllocationLowUqScore: FC<AllocationLowUqScoreProps> = ({ onAllocate, onCloseModal }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.allocation.lowUQScoreModal',
  });
  const [isChecked, setIsChecked] = useState(false);
  const [isRefetchRequired, setIsRefetchRequired] = useState(false);

  const { address } = useAccount();

  const { data: currentEpoch } = useCurrentEpoch();
  const {
    data: uqScore,
    refetch: refetchUqScore,
    isFetching: isFetchingUqScore,
  } = useUqScore(currentEpoch!);
  const { mutateAsync: refreshAntisybilStatus, isPending: isPendingRefreshAntisybilStatus } =
    useRefreshAntisybilStatus();

  const windowOnFocus = () => {
    if (!address) {
      return;
    }
    refreshAntisybilStatus(address).then(() => {
      refetchUqScore();
      setIsRefetchRequired(false);
    });
  };

  const windowOnBlur = () => {
    setIsRefetchRequired(true);
  };

  useEffect(() => {
    window.addEventListener('focus', windowOnFocus);
    window.addEventListener('blur', windowOnBlur);

    return () => {
      window.removeEventListener('focus', windowOnFocus);
      window.removeEventListener('blur', windowOnBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When user manages to increase their score to what gives UQ score of 100, close the modal.
    if (!uqScore || uqScore < 100n) {
      return;
    }
    toastService.showToast({
      message: t('toasts.success.message'),
      name: 'uqScoreSuccessfullyIncreased',
      title: t('toasts.success.title'),
      type: 'success',
    });
    onCloseModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uqScore]);

  const isFetching = isRefetchRequired || isFetchingUqScore || isPendingRefreshAntisybilStatus;

  return (
    <>
      <div className={styles.text}>
        <Trans components={[<b />]} i18nKey="components.allocation.lowUQScoreModal.text" />
      </div>
      <BoxRounded className={styles.box} hasPadding={false} isGrey>
        <InputCheckbox
          className={styles.checkbox}
          dataTest="AllocationLowUqScore__InputCheckbox"
          isChecked={isChecked}
          // eslint-disable-next-line  @typescript-eslint/naming-convention
          onChange={() => setIsChecked(prev => !prev)}
          size="big"
        />
        <label className={styles.checkboxLabel}>{t('checkboxLabel')}</label>
      </BoxRounded>
      <div className={styles.buttonsContainer}>
        <Button
          className={styles.button}
          dataTest="AllocationLowUqScore__Button--gitcoinPassport"
          href={PASSPORT_XYZ_CUSTOM_OCTANT_DASHBOARD}
          target="_blank"
        >
          {t('goToGitcoinPassportCustomOctantDashboard')}
        </Button>
        <Button
          className={styles.button}
          dataTest="AllocationLowUqScore__Button--cta"
          isDisabled={!isChecked}
          isLoading={isFetching}
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
