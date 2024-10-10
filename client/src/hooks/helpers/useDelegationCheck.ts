import uniq from 'lodash/uniq';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnectors } from 'wagmi';

import useCheckDelegation from 'hooks/mutations/useCheckDelegation';
import useRefreshAntisybilStatus from 'hooks/mutations/useRefreshAntisybilStatus';
import useAntisybilStatusScore, {
  AntisybilStatusScore,
} from 'hooks/queries/useAntisybilStatusScore';
import useUserTOS from 'hooks/queries/useUserTOS';
import toastService from 'services/toastService';
import useDelegationStore from 'store/delegation/store';

export default function useDelegationCheck(): {
  antisybilStatusScore: AntisybilStatusScore | undefined;
  isSuccessAntisybilStatusScore: boolean;
} {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridUQScore',
  });
  const { address } = useAccount();

  const connectors = useConnectors();

  const { data: isUserTOSAccepted } = useUserTOS();
  const { mutateAsync: checkDelegationMutation } = useCheckDelegation();
  const {
    mutateAsync: refreshAntisybilStatus,
    isSuccess: isSuccessRefreshAntisybilStatus,
    error: refreshAntisybilStatusError,
  } = useRefreshAntisybilStatus();
  const {
    delegationPrimaryAddress,
    setDelegationPrimaryAddress,
    setDelegationSecondaryAddress,
    delegationSecondaryAddress,
    setIsDelegationCompleted,
    isDelegationCompleted,
  } = useDelegationStore(state => ({
    delegationPrimaryAddress: state.data.delegationPrimaryAddress,
    delegationSecondaryAddress: state.data.delegationSecondaryAddress,
    isDelegationCompleted: state.data.isDelegationCompleted,
    setDelegationPrimaryAddress: state.setDelegationPrimaryAddress,
    setDelegationSecondaryAddress: state.setDelegationSecondaryAddress,
    setIsDelegationCompleted: state.setIsDelegationCompleted,
  }));
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

  return {
    antisybilStatusScore,
    isSuccessAntisybilStatusScore,
  };
}
