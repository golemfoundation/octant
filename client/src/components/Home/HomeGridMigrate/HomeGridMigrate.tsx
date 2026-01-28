import React, { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalMigration from 'components/Home/ModalMigration';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';
import env from 'env';
import useIsUserMigrationDoneOrRequired from 'hooks/helpers/useIsUserMigrationDoneOrRequired';

import styles from './HomeGridMigrate.module.scss';
import HomeGridMigrateProps from './types';

const HomeGridMigrate: FC<HomeGridMigrateProps> = ({ className }) => {
  const { regenStakerUrl } = env;
  const { isConnected } = useAccount();
  const {
    data: { isUserMigrationRequired, isUserMigrationDone },
    isFetching: isFetchingIsUserMigrationDoneOrRequired,
  } = useIsUserMigrationDoneOrRequired();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridMigrate',
  });
  const [isModalMigrateOpen, setIsModalMigrateOpen] = useState<boolean>(false);

  const buttonMigrateLabel = useMemo(() => {
    if (isUserMigrationRequired) {
      return t('buttonLabel.beforeMigration');
    }
    if (isUserMigrationDone) {
      return t('buttonLabel.afterMigration');
    }
    if (!isUserMigrationRequired) {
      return t('buttonLabel.noMigration');
    }
    return t('buttonLabel.beforeMigration');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserMigrationRequired, isUserMigrationDone]);

  return (
    <>
      <GridTile className={className} dataTest="HomeGridMigrate" title={t('title')}>
        <div className={styles.root}>
          <Img className={styles.image} src="/images/migration/migration.webp" />
          <div className={styles.text}>{t('text')}</div>
          <Button
            className={styles.button}
            dataTest="HomeGridMigrate__Button"
            isDisabled={!isConnected || (isConnected && !isUserMigrationRequired)}
            isHigh
            isLoading={isFetchingIsUserMigrationDoneOrRequired}
            label={buttonMigrateLabel}
            onClick={isUserMigrationRequired ? () => setIsModalMigrateOpen(true) : undefined}
            to={isUserMigrationDone ? regenStakerUrl : undefined}
            variant="cta"
          />
        </div>
      </GridTile>
      <ModalMigration
        modalProps={{
          dataTest: 'ModalMigration',
          isOpen: isModalMigrateOpen,
          onClosePanel: () => setIsModalMigrateOpen(false),
        }}
      />
    </>
  );
};

export default HomeGridMigrate;
