import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from 'components/ui/Button';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';

import styles from './EpochResultsDetails.module.scss';
import EpochResultsDetailsProps from './types';

const EpochResultsDetails: FC<EpochResultsDetailsProps> = ({ details }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const { isMobile } = useMediaQuery();
  const navigate = useNavigate();
  const getValuesToDisplay = useGetValuesToDisplay();

  const donationsToDisplay = details
    ? getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        valueCrypto: details.donations,
      }).primary
    : null;

  const matchingToDisplay = details
    ? getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        valueCrypto: details.donations,
      }).primary
    : null;

  const totalToDisplay = details
    ? getValuesToDisplay({
        cryptoCurrency: 'ethereum',
        showCryptoSuffix: true,
        valueCrypto: details.donations + details.matchingFund,
      }).primary
    : null;

  return (
    <div className={styles.root}>
      {details ? (
        <>
          <div className={styles.projectName}>{details.name}</div>
          <div className={styles.donations}>
            {isMobile ? t('donationsShort') : t('donations')} {donationsToDisplay}
          </div>
          <div className={styles.matching}>
            {isMobile ? t('matchingShort') : t('matching')} {matchingToDisplay}
          </div>
          <div className={styles.total}>
            {isMobile ? t('totalShort') : t('total')} {totalToDisplay}
          </div>
          {!isMobile && (
            <Button
              className={styles.link}
              onClick={() =>
                navigate(`${ROOT_ROUTES.project.absolute}/${details.epoch}/${details.address}`)
              }
              variant="link"
            >
              {t('clickToVisitProject')}
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
};

export default EpochResultsDetails;
