import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/ui/Button';
import useGetValuesToDisplay from 'hooks/helpers/useGetValuesToDisplay';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useProjectsIpfs from 'hooks/queries/useProjectsIpfs';

import styles from './EpochResultsDetails.module.scss';
import EpochResultsDetailsProps from './types';

const EpochResultsDetails: FC<EpochResultsDetailsProps> = ({ details }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const { isMobile } = useMediaQuery();
  const getValuesToDisplay = useGetValuesToDisplay();

  const { data: projectsIpfs } = useProjectsIpfs([details?.address], 5, details !== null);

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
        valueCrypto: details.donations + details.matching,
      }).primary
    : null;

  return (
    <div className={styles.root}>
      {details ? (
        <>
          <div className={styles.projectName}>{projectsIpfs?.[0]?.name}</div>
          <div className={styles.donations}>
            {isMobile ? 'D' : t('donations')} {donationsToDisplay}
          </div>
          <div className={styles.matching}>
            {isMobile ? 'M' : t('matching')} {matchingToDisplay}
          </div>
          <div className={styles.total}>
            {isMobile ? 'T' : t('total')} {totalToDisplay}
          </div>
          {!isMobile && (
            <Button className={styles.link} variant="link">
              {t('clickToVisitProject')}
            </Button>
          )}
        </>
      ) : null}
    </div>
  );
};

export default EpochResultsDetails;
