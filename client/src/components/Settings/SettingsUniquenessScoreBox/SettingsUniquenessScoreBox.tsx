import { watchAccount } from '@wagmi/core';
import React, { ReactNode, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { wagmiConfig } from 'api/clients/client-wagmi';
import ModalSettingsCalculatingUQScore from 'components/Settings/ModalSettingsCalculatingUQScore';
import ModalSettingsCalculatingYourUniqueness from 'components/Settings/ModalSettingsCalculatingYourUniqueness';
import ModalSettingsRecalculatingScore from 'components/Settings/ModalSettingsRecalculatingScore';
import SettingsUniquenessScoreAddresses from 'components/Settings/SettingsUniquenessScoreAddresses';
import BoxRounded from 'components/ui/BoxRounded';
import Button from 'components/ui/Button';
import useSettingsStore from 'store/settings/store';

import styles from './SettingsUniquenessScoreBox.module.scss';

const SettingsUniquenessScoreBox = (): ReactNode => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.settings' });
  const {
    isDelegationInProgress,
    isDelegationCalculatingUQScoreModalOpen,
    isDelegationCompleted,
    setIsDelegationInProgress,
    setIsDelegationConnectModalOpen,
    setDelegationPrimaryAddress,
    setDelegationSecondaryAddress,
    setIsDelegationCalculatingUQScoreModalOpen,
  } = useSettingsStore(state => ({
    isDelegationCalculatingUQScoreModalOpen: state.data.isDelegationCalculatingUQScoreModalOpen,
    isDelegationCompleted: state.data.isDelegationCompleted,
    isDelegationInProgress: state.data.isDelegationInProgress,
    setDelegationPrimaryAddress: state.setDelegationPrimaryAddress,
    setDelegationSecondaryAddress: state.setDelegationSecondaryAddress,
    setIsDelegationCalculatingUQScoreModalOpen: state.setIsDelegationCalculatingUQScoreModalOpen,
    setIsDelegationConnectModalOpen: state.setIsDelegationConnectModalOpen,
    setIsDelegationInProgress: state.setIsDelegationInProgress,
  }));
  const [isRecalculatingScoreModalOpen, setIisRecalculatingScoreModalOpen] = useState(false);
  const { address } = useAccount();

  const [isCalculatingYourUniquenessModalOpen, setIsCalculatingYourUniquenessModalOpen] =
    useState(false);

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
        <SettingsUniquenessScoreAddresses />
        <div className={styles.buttonsWrapper}>
          <Button
            className={styles.button}
            isHigh
            onClick={() => setIisRecalculatingScoreModalOpen(true)}
            variant="cta"
          >
            {t('recalculate')}
          </Button>
          <Button
            className={styles.button}
            isDisabled={isDelegationCompleted}
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
        <ModalSettingsCalculatingUQScore
          modalProps={{
            isOpen: isDelegationCalculatingUQScoreModalOpen,
            onClosePanel: () => setIsDelegationCalculatingUQScoreModalOpen(false),
          }}
        />
        <ModalSettingsRecalculatingScore
          modalProps={{
            isOpen: isRecalculatingScoreModalOpen,
            onClosePanel: () => setIisRecalculatingScoreModalOpen(false),
          }}
        />
        <ModalSettingsCalculatingYourUniqueness
          modalProps={{
            isOpen: isCalculatingYourUniquenessModalOpen,
            onClosePanel: () => setIsCalculatingYourUniquenessModalOpen(false),
          }}
        />
      </>
    </BoxRounded>
  );
};

export default memo(SettingsUniquenessScoreBox);
