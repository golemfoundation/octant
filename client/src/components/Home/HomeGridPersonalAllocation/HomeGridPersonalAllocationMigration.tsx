import cx from 'classnames';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalWithdrawEth from 'components/Home/HomeGridPersonalAllocation/ModalWithdrawEth';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useWithdrawals from 'hooks/queries/useWithdrawals';
import useTransactionLocalStore from 'store/transactionLocal/store';
import getIsPreLaunch from 'utils/getIsPreLaunch';

import styles from './HomeGridPersonalAllocation.module.scss';
import HomeGridPersonalAllocationProps from './types';

const HomeGridPersonalAllocationMigration: FC<HomeGridPersonalAllocationProps> = ({
  className,
}) => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridPersonalAllocation',
  });
  const [isModalWithdrawEthOpen, setIsModalWithdrawEthOpen] = useState<boolean>(false);
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: withdrawals, isFetching: isFetchingWithdrawals } = useWithdrawals();
  const { isAppWaitingForTransactionToBeIndexed } = useTransactionLocalStore(state => ({
    isAppWaitingForTransactionToBeIndexed: state.data.isAppWaitingForTransactionToBeIndexed,
    transactionsPending: state.data.transactionsPending,
  }));

  const isPreLaunch = getIsPreLaunch(currentEpoch);

  return (
    <>
      <GridTile
        className={className}
        dataTest="HomeGridPersonalAllocationMigration"
        title={t('migration.text')}
      >
        <div className={cx(styles.root, styles.isMigration)}>
          <Img className={styles.image} src="/images/migration/withdraw.webp" />
          <Button
            className={styles.button}
            dataTest="HomeGridPersonalAllocation__Button"
            isDisabled={
              isPreLaunch ||
              !isConnected ||
              isFetchingWithdrawals ||
              isAppWaitingForTransactionToBeIndexed ||
              withdrawals?.sums.available === 0n
            }
            isHigh
            onClick={() => setIsModalWithdrawEthOpen(true)}
            variant="cta"
          >
            {t('withdrawToWallet')}
          </Button>
        </div>
      </GridTile>
      <ModalWithdrawEth
        modalProps={{
          dataTest: 'ModalWithdrawEth',
          isOpen: isModalWithdrawEthOpen,
          onClosePanel: () => setIsModalWithdrawEthOpen(false),
        }}
      />
    </>
  );
};

export default HomeGridPersonalAllocationMigration;
