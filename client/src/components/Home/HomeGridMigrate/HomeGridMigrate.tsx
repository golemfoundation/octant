import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import ModalMigration from 'components/Home/ModalMigration';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Img from 'components/ui/Img';

import styles from './HomeGridMigrate.module.scss';
import HomeGridMigrateProps from './types';

const HomeGridMigrate: FC<HomeGridMigrateProps> = ({ className }) => {
  const { isConnected } = useAccount();
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridMigrate',
  });
  const [isModalMigrateOpen, setIsModalMigrateOpen] = useState<boolean>(false);

  return (
    <>
      <GridTile className={className} dataTest="HomeGridMigrate" title={t('title')}>
        <div className={styles.root}>
          <Img className={styles.image} src="/images/migration/migration.webp" />
          <div className={styles.text}>{t('text')}</div>
          <Button
            className={styles.button}
            dataTest="HomeGridMigrate__Button"
            isDisabled={!isConnected}
            isHigh
            onClick={() => setIsModalMigrateOpen(true)}
            variant="cta"
          >
            {t('buttonLabel')}
          </Button>
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
