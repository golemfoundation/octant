/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from 'components/ui/Button';
import useGetValuesToDisplay, {
  GetValuesToDisplayProps,
} from 'hooks/helpers/useGetValuesToDisplay';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { ROOT_ROUTES } from 'routes/RootRoutes/routes';

import styles from './EpochResultsDetails.module.scss';
import EpochResultsDetailsProps from './types';

const EpochResultsDetails: FC<EpochResultsDetailsProps> = ({
  details,
  isLoading,
  isScrollable,
  scrollDirection,
  epoch,
  isDragging,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile } = useMediaQuery();
  const navigate = useNavigate();
  const getValuesToDisplay = useGetValuesToDisplay();
  const [dots, setDots] = useState(0);
  const [showScrollInfo, setShowScrollInfo] = useState(false);

  const getValuesToDisplayCommonProps: GetValuesToDisplayProps = {
    cryptoCurrency: 'ethereum',
    getFormattedEthValueProps: {
      maxNumberOfDigitsToShow: 5,
      shouldIgnoreGwei: true,
      shouldIgnoreWei: true,
      showShortFormat: isMobile,
    },
    showCryptoSuffix: true,
  };

  const donationsToDisplay = details
    ? getValuesToDisplay({
        ...getValuesToDisplayCommonProps,
        valueCrypto: details.donations,
      }).primary
    : null;

  const matchingToDisplay = details
    ? getValuesToDisplay({
        ...getValuesToDisplayCommonProps,
        valueCrypto: details.matchedRewards,
      }).primary
    : null;

  const totalToDisplay = details
    ? getValuesToDisplay({
        ...getValuesToDisplayCommonProps,
        valueCrypto: details.totalValueOfAllocations,
      }).primary
    : null;

  const isScrollInfoVisible =
    (isMobile && isDragging) ||
    (showScrollInfo && (isMobile || (!isMobile && scrollDirection === 'right')));

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    const id = setInterval(
      () =>
        setDots(prev => {
          if (prev === 3) {
            return 0;
          }
          return prev + 1;
        }),
      300,
    );
    return () => {
      clearInterval(id);
      setDots(0);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const listener = e => {
      if (ref.current && ref.current.contains(e.target)) {
        return;
      }
      setShowScrollInfo(false);
    };

    document.addEventListener('click', listener);

    return () => document.removeEventListener('click', listener);
  }, [isMobile]);

  return (
    <div
      ref={ref}
      className={styles.root}
      onMouseLeave={() => {
        if (!isScrollable) {
          return;
        }
        setShowScrollInfo(false);
      }}
      onMouseOver={() => {
        if (!isScrollable) {
          return;
        }
        setShowScrollInfo(true);
      }}
    >
      {isLoading && (
        <div className={styles.loading}>
          {t('loadingChartData')}
          {[...Array(dots).keys()].map(key => (
            <span key={`dot__${key}`}>.</span>
          ))}
        </div>
      )}
      {isScrollInfoVisible && (
        <div className={styles.scrollInfo}>
          {scrollDirection === 'left' && '←'}
          <span className={styles.scrollInfoText}>
            {isMobile ? t('scrollInfoMobile') : t('scrollInfo')}
          </span>
          {scrollDirection === 'right' && '→'}
        </div>
      )}
      {!isScrollInfoVisible && details && (
        <>
          <div className={styles.projectName}>{details.name}</div>
          <div className={styles.donations}>
            {isMobile ? t('donationsShort') : i18n.t('common.donations')}
            {isMobile ? '' : ' '}
            {donationsToDisplay}
          </div>
          <div className={styles.matching}>
            {isMobile ? t('matchingShort') : i18n.t('common.matching')}
            {isMobile ? '' : ' '}
            {matchingToDisplay}
          </div>
          <div className={styles.total}>
            {isMobile ? t('totalShort') : i18n.t('common.total')}
            {isMobile ? '' : ' '}
            {totalToDisplay}
          </div>
          {!isMobile && (
            <Button
              className={styles.link}
              onClick={() =>
                navigate(`${ROOT_ROUTES.project.absolute}/${epoch}/${details.address}`)
              }
              onMouseOver={e => e.stopPropagation()}
              variant="link"
            >
              {t('clickToVisitProject')}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EpochResultsDetails;
