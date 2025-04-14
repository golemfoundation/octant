import { watchAccount } from '@wagmi/core';
import uniq from 'lodash/uniq';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnectors } from 'wagmi';

import { wagmiConfig } from 'api/clients/client-wagmi';
import HomeGridUQScoreAddresses from 'components/Home/HomeGridUQScore/HomeGridUQScoreAddresses';
import ModalCalculatingUQScore from 'components/Home/HomeGridUQScore/ModalCalculatingUQScore';
import ModalCalculatingYourUniqueness from 'components/Home/HomeGridUQScore/ModalCalculatingYourUniqueness';
import ModalRecalculatingScore from 'components/Home/HomeGridUQScore/ModalRecalculatingScore';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import { TOURGUIDE_ELEMENT_4 } from 'constants/domElementsIds';
import { UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1 } from 'constants/uq';
import {
  GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD,
  TIME_OUT_LIST_DISPUTE_FORM,
} from 'constants/urls';
import useCheckDelegation from 'hooks/mutations/useCheckDelegation';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore from 'hooks/queries/useAntisybilStatusScore';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useUqScore from 'hooks/queries/useUqScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import toastService from 'services/toastService';
import useDelegationStore from 'store/delegation/store';

import styles from './HomeGridUQScore.module.scss';
import HomeGridUQScoreProps from './types';

const HomeGridUQScore: FC<HomeGridUQScoreProps> = ({ className }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridUQScore',
  });
  const { address, isConnected } = useAccount();
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
  } = useDelegationStore(state => ({
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

  const modalCalculatingUQScoreProps = useMemo(() => {
    return {
      isOpen: isDelegationCalculatingUQScoreModalOpen,
      onClosePanel: () => setIsDelegationCalculatingUQScoreModalOpen(false),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDelegationCalculatingUQScoreModalOpen]);

  const modalRecalculatingScoreProps = useMemo(() => {
    return {
      isOpen: isRecalculatingScoreModalOpen,
      onClosePanel: () => setIsRecalculatingScoreModalOpen(false),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecalculatingScoreModalOpen]);

  const modalCalculatingYourUniquenessProps = useMemo(() => {
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
      setSecondaryAddressScore(antisybilStatusScore?.score);
    } else {
      if (refreshAntisybilStatusError) {
        setDelegationPrimaryAddress(address);
        setDelegationSecondaryAddress('0x???');
      }
      setPrimaryAddressScore(
        antisybilStatusScore?.score < UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1 && uqScore === 100n
          ? UQ_SCORE_THRESHOLD_FOR_LEVERAGE_1
          : antisybilStatusScore?.score,
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

  const isRecalculateButtonDisabled =
    !isConnected ||
    isDelegationCompleted ||
    isFetchingScore ||
    isFetchingUqScore ||
    delegationSecondaryAddress === '0x???' ||
    antisybilStatusScore?.isOnTimeOutList;

  const isDelegateButtonDisabled =
    !isConnected ||
    isDelegationCompleted ||
    isFetchingScore ||
    primaryAddressScore === null ||
    primaryAddressScore === undefined ||
    primaryAddressScore >= 20 ||
    isFetchingUqScore ||
    uqScore === 100n ||
    delegationSecondaryAddress === '0x???' ||
    antisybilStatusScore?.isOnTimeOutList;

  return (
    <>
      <GridTile
        className={className}
        dataTest="HomeGridUQScore"
        id={TOURGUIDE_ELEMENT_4}
        title={t('yourUniquenessScore')}
        titleSuffix={
          <Button
            className={styles.titleSuffix}
            dataTest="HomeGridUQScore__Button--whatIsThis"
            isButtonScalingUpOnHover={false}
            label={t('whatIsThis')}
            onClick={() => setIsCalculatingYourUniquenessModalOpen(true)}
            variant="link3"
          />
        }
      >
        <div className={styles.root}>
          <HomeGridUQScoreAddresses
            isFetchingScore={isFetchingScore}
            isOnTimeOutList={antisybilStatusScore?.isOnTimeOutList}
          />
          {antisybilStatusScore?.isOnTimeOutList ? (
            <Button
              className={styles.furtherActions}
              dataTest="HomeGridUQScore__Button--form"
              href={TIME_OUT_LIST_DISPUTE_FORM}
              label={t('wantToDispute')}
              variant="link6"
            />
          ) : (
            <Button
              className={styles.furtherActions}
              dataTest="HomeGridUQScore__Button--scoreTooLow"
              href={GITCOIN_PASSPORT_CUSTOM_OCTANT_DASHBOARD}
              label={t('scoreTooLow')}
              variant="link6"
            />
          )}
          <div className={styles.buttonsWrapper}>
            <Button
              className={styles.button}
              dataTest="HomeGridUQScore__Button--recalculate"
              isDisabled={isRecalculateButtonDisabled}
              isHigh
              onClick={() => setIsRecalculatingScoreModalOpen(true)}
              variant="cta"
            >
              {t('recalculate')}
            </Button>
            <Button
              className={styles.button}
              dataTest="HomeGridUQScore__Button--delegate"
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
        </div>
      </GridTile>
      <ModalCalculatingUQScore modalProps={modalCalculatingUQScoreProps} />
      <ModalRecalculatingScore modalProps={modalRecalculatingScoreProps} />
      <ModalCalculatingYourUniqueness modalProps={modalCalculatingYourUniquenessProps} />
    </>
  );
};

export default HomeGridUQScore;
