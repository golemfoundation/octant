import { watchAccount } from '@wagmi/core';
import uniq from 'lodash/uniq';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnectors } from 'wagmi';

import { wagmiConfig } from 'api/clients/client-wagmi';
import ModalSettingsCalculatingUQScore from 'components/Settings/ModalSettingsCalculatingUQScore';
import ModalSettingsCalculatingYourUniqueness from 'components/Settings/ModalSettingsCalculatingYourUniqueness';
import ModalSettingsRecalculatingScore from 'components/Settings/ModalSettingsRecalculatingScore';
import SettingsUniquenessScoreAddresses from 'components/Settings/SettingsUniquenessScoreAddresses';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import { DELEGATION_MIN_SCORE } from 'constants/delegation';
import { GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD } from 'constants/urls';
import useCheckDelegation from 'hooks/mutations/useCheckDelegation';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUqScore from 'hooks/queries/useUqScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import toastService from 'services/toastService';
import useSettingsStore from 'store/settings/store';

import styles from './SettingsUniquenessScoreBox.module.scss';

const SettingsUniquenessScoreBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const { address } = useAccount();
  const connectors = useConnectors();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: isUserTOSAccepted } = useUserTOS();

  const { data: uqScore, isFetching: isFetchingUqScore } = useUqScore(currentEpoch!);

  const [isRecalculatingScoreModalOpen, setIsRecalculatingScoreModalOpen] = useState(false);
  const [isCalculatingYourUniquenessModalOpen, setIsCalculatingYourUniquenessModalOpen] =
    useState(false);

  const {
    delegationPrimaryAddress,
    delegationSecondaryAddress,
    primaryAddressScore,
    isDelegationInProgress,
    isDelegationCalculatingUQScoreModalOpen,
    isDelegationCompleted,
    setPrimaryAddressScore,
    setSecondaryAddressScore,
    setIsDelegationInProgress,
    setIsDelegationConnectModalOpen,
    setDelegationPrimaryAddress,
    setDelegationSecondaryAddress,
    setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationCompleted,
  } = useSettingsStore(state => ({
    delegationPrimaryAddress: state.data.delegationPrimaryAddress,
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    isDelegationCalculatingUQScoreModalOpen: state.data.isDelegationCalculatingUQScoreModalOpen,
    isDelegationCompleted: state.data.isDelegationCompleted,
    isDelegationInProgress: state.data.isDelegationInProgress,
    primaryAddressScore: state.data.primaryAddressScore,
    setDelegationPrimaryAddress: state.setDelegationPrimaryAddress,
    setDelegationSecondaryAddress: state.setDelegationSecondaryAddress,
    setIsDelegationCalculatingUQScoreModalOpen: state.setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationCompleted: state.setIsDelegationCompleted,
    setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
    setIsDelegationInProgress: state.setIsDelegationInProgress,
    setPrimaryAddressScore: state.setPrimaryAddressScore,
    setSecondaryAddressScore: state.setSecondaryAddressScore,
  }));

  const [isFetchingScore, setIsFetchingScore] = useState(
    isDelegationCompleted
      ? delegationSecondaryAddress === null
      : primaryAddressScore === null || primaryAddressScore !== address,
  );

  const isRecalculateButtonDisabled =
    isDelegationCompleted ||
    isFetchingScore ||
    isFetchingUqScore ||
    delegationSecondaryAddress === '0x???';

  const isDelegateButtonDisabled =
    isDelegationCompleted ||
    isFetchingScore ||
    primaryAddressScore === null ||
    primaryAddressScore === undefined ||
    primaryAddressScore >= 20 ||
    isFetchingUqScore ||
    uqScore === 100n ||
    delegationSecondaryAddress === '0x???';

  const { mutateAsync: checkDelegationMutation } = useCheckDelegation();
  const {
    mutateAsync: refreshAntisybilStatus,
    isSuccess: isSuccessRefreshAntisybilStatus,
    error: refreshAntisybilStatusError,
  } = useRefreshAntisybilStatus();

  const { data: antisybilStatusScore, isSuccess: isSuccessAntisybilStatusScore } =
    useAntisybilStatusScore(
      isDelegationCompleted && delegationSecondaryAddress !== '0x???'
        ? delegationSecondaryAddress!
        : address!,
      {
        enabled:
          isSuccessRefreshAntisybilStatus ||
          (refreshAntisybilStatusError as null | { message: string })?.message ===
            'Address is already used for delegation',
      },
    );

  const modalSettingsCalculatingUQScoreProps = useMemo(() => {
    return {
      isOpen: isDelegationCalculatingUQScoreModalOpen,
      onClosePanel: () => setIsDelegationCalculatingUQScoreModalOpen(false),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDelegationCalculatingUQScoreModalOpen]);

  const modalSettingsRecalculatingScoreProps = useMemo(() => {
    return {
      isOpen: isRecalculatingScoreModalOpen,
      onClosePanel: () => setIsRecalculatingScoreModalOpen(false),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecalculatingScoreModalOpen]);

  const modalSettingsCalculatingYourUniquenessProps = useMemo(() => {
    return {
      isOpen: isCalculatingYourUniquenessModalOpen,
      onClosePanel: () => setIsCalculatingYourUniquenessModalOpen(false),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalculatingYourUniquenessModalOpen]);

  const checkDelegation = async () => {
    if (!isUserTOSAccepted) {
      return;
    }
    const accountsPromises = connectors.map(connector => connector.getAccounts());
    /**
     * In Safari browsers this array of promises results in an empty result,
     * resulting in an error thrown from wagmi, ProviderNotFoundError.
     *
     * Adding empty catch here solves the problem.
     */
    const addresses = await Promise.all(accountsPromises).catch(() => {});
    const uniqAddresses = addresses ? uniq(addresses.flat()) : [];
    if (uniqAddresses.length < 2) {
      refreshAntisybilStatus(address!);
      return;
    }
    if (uniqAddresses.length > 10) {
      refreshAntisybilStatus(address!);
      toastService.showToast({
        message: t('toasts.delegationTooManyUniqueAddresses.message'),
        name: 'delegationTooManyUniqueAddresses',
        title: t('toasts.delegationTooManyUniqueAddresses.title'),
        type: 'error',
      });
      return;
    }
    checkDelegationMutation(uniqAddresses)
      .then(({ primary, secondary }) => {
        setDelegationPrimaryAddress(primary);
        setDelegationSecondaryAddress(secondary);
        setIsDelegationCompleted(true);
        refreshAntisybilStatus(secondary);
      })
      .catch(() => {
        refreshAntisybilStatus(address!);
      });
  };

  useEffect(() => {
    if (!isSuccessAntisybilStatusScore || isDelegationInProgress || isFetchingUqScore) {
      return;
    }
    if (isDelegationCompleted) {
      setSecondaryAddressScore(antisybilStatusScore);
    } else {
      if (refreshAntisybilStatusError) {
        setDelegationPrimaryAddress(address);
        setDelegationSecondaryAddress('0x???');
      }
      setPrimaryAddressScore(
        antisybilStatusScore < DELEGATION_MIN_SCORE && uqScore === 100n
          ? DELEGATION_MIN_SCORE
          : antisybilStatusScore,
      );
    }
    setIsFetchingScore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessAntisybilStatusScore, isFetchingUqScore, refreshAntisybilStatusError]);

  useEffect(() => {
    if (
      !isDelegationInProgress ||
      isDelegationCompleted ||
      isDelegationCalculatingUQScoreModalOpen
    ) {
      return;
    }

    const unwatch = watchAccount(wagmiConfig, {
      onChange(data) {
        setDelegationSecondaryAddress(data.address);
        setIsDelegationCalculatingUQScoreModalOpen(true);
        unwatch();
      },
    });
    return () => {
      unwatch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDelegationInProgress]);

  useEffect(() => {
    if (
      (isDelegationCompleted &&
        (delegationPrimaryAddress === address || delegationSecondaryAddress === address)) ||
      !isUserTOSAccepted
    ) {
      return;
    }
    setIsDelegationCompleted(false);
    checkDelegation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserTOSAccepted, address]);

  return (
    <BoxRounded
      alignment="left"
      className={styles.root}
      hasPadding={false}
      hasSections
      isVertical
      justifyContent="spaceBetween"
      textAlign="left"
      title={t('yourUniquenessScore')}
      titleSuffix={
        <div
          className={styles.titleSuffix}
          onClick={() => setIsCalculatingYourUniquenessModalOpen(true)}
        >
          {t('whatIsThis')}
        </div>
      }
    >
      <>
        <Button
          className={styles.visitDashboard}
          href={GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD}
          label={t('visitOurPassportDashboard')}
          variant="link"
        />
        <SettingsUniquenessScoreAddresses isFetchingScore={isFetchingScore} />
        <div className={styles.buttonsWrapper}>
          <Button
            className={styles.button}
            isDisabled={isRecalculateButtonDisabled}
            isHigh
            onClick={() => setIsRecalculatingScoreModalOpen(true)}
            variant="cta"
          >
            {t('recalculate')}
          </Button>
          <Button
            className={styles.button}
            isDisabled={isDelegateButtonDisabled}
            isHigh
            onClick={() => {
              setIsDelegationInProgress(true);
              setDelegationPrimaryAddress(address);
              setIsDelegationConnectModalOpen(true);
            }}
          >
            {t('delegate')}
          </Button>
        </div>
        <ModalSettingsCalculatingUQScore modalProps={modalSettingsCalculatingUQScoreProps} />
        <ModalSettingsRecalculatingScore modalProps={modalSettingsRecalculatingScoreProps} />
        <ModalSettingsCalculatingYourUniqueness
          modalProps={modalSettingsCalculatingYourUniquenessProps}
        />
      </>
    </BoxRounded>
  );
};

export default SettingsUniquenessScoreBox;
