/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useGetValuesToDisplay, {
  GetValuesToDisplayProps,
} from 'hooks/helpers/useGetValuesToDisplay';
import useMediaQuery from 'hooks/helpers/useMediaQuery';

import styles from './EpochResultsDetails.module.scss';
import EpochResultsDetailsProps from './types';

const EpochResultsDetails: FC<EpochResultsDetailsProps> = ({
  details,
  isLoading,
  isScrollable,
  scrollDirection,
  isDragging,
  onMouseMove,
  onMouseDown,
}) => {
  const { i18n, t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridEpochResults',
  });
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile } = useMediaQuery();
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

  const isScrollInfoVisible = isDragging || showScrollInfo;

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
      onMouseDown={e => {
        if (!isScrollable) {
          return;
        }
        onMouseDown(e.pageX);
      }}
      onMouseLeave={e => {
        e.stopPropagation();
        if (!isScrollable) {
          return;
        }
        setShowScrollInfo(false);
      }}
      onMouseMove={e => {
        if (!isScrollable) {
          return;
        }
        onMouseMove(e.pageX);
      }}
      onMouseOver={e => {
        e.stopPropagation();
        if (!isScrollable) {
          return;
        }
        setShowScrollInfo(true);
      }}
      onTouchEnd={() => {
        if (!isScrollable) {
          return;
        }
        setShowScrollInfo(false);
      }}
      onTouchMove={e => {
        if (!isScrollable) {
          return;
        }
        e.stopPropagation();
        onMouseMove(e.changedTouches[0].pageX);
      }}
      onTouchStart={e => {
        if (!isScrollable) {
          return;
        }
        setShowScrollInfo(true);
        onMouseDown(e.changedTouches[0].pageX);
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
        </>
      )}
    </div>
  );
};

export default EpochResultsDetails;
