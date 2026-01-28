import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalLockGlm from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm';
import Button from 'components/ui/Button';
import { SABLIER_APP_LINK } from 'constants/urls';
import useDepositValue from 'hooks/queries/useDepositValue';
import useUserSablierStreams from 'hooks/queries/useUserSablierStreams';

import HomeGridCurrentGlmLockMigrationProps from './types';

const HomeGridCurrentGlmLockMigration: FC<HomeGridCurrentGlmLockMigrationProps> = ({
  className,
}) => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridCurrentGlmLock',
  });

  const [isModalLockGlmOpen, setIsModalLockGlmOpen] = useState<boolean>(false);
  const { data: depositsValue, isFetching: isFetchingDepositValue } = useDepositValue();
  const { data: userSablierStreams, isFetching: isFetchinguserSablierStreams } =
    useUserSablierStreams();

  const userSablierStreamsValue =
    !userSablierStreams?.sablierStreams.some(({ isCancelled }) => isCancelled) &&
    userSablierStreams?.sumAvailable;

  const lockValue = depositsValue || 0n;

  if (isFetchingDepositValue || isFetchinguserSablierStreams) {
    return <div />;
  }

  return (
    <>
      {lockValue !== 0n && (
        <Button
          className={className}
          dataTest="HomeGridCurrentGlmLockMigration__ButtonDeposits"
          isDisabled={!isConnected}
          onClick={() => setIsModalLockGlmOpen(true)}
          variant="link5"
        >
          {t('migration.buttonLabel')}
        </Button>
      )}
      {userSablierStreamsValue !== 0n && (
        <Button
          className={className}
          dataTest="HomeGridCurrentGlmLockMigration__ButtonSablier"
          href={SABLIER_APP_LINK}
          isDisabled={!isConnected}
          variant="link5"
        >
          {t('migration.sablierStreams')}
        </Button>
      )}
      <ModalLockGlm
        modalProps={{
          dataTest: 'ModalLockGlm',
          isOpen: isModalLockGlmOpen,
          onClosePanel: () => setIsModalLockGlmOpen(false),
        }}
      />
    </>
  );
};

export default HomeGridCurrentGlmLockMigration;
