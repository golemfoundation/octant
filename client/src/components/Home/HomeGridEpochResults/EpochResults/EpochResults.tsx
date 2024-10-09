import cx from 'classnames';
import { maxBy } from 'lodash';
import React, { FC, useEffect, useRef, useState } from 'react';

import EpochResultsBar from 'components/Home/HomeGridEpochResults/EpochResultsBar';
import EpochResultsDetails from 'components/Home/HomeGridEpochResults/EpochResultsDetails';
import Img from 'components/ui/Img';
import { EPOCH_RESULTS_BAR_ID } from 'constants/domElementsIds';
import env from 'env';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { ProjectIpfsWithRewards } from 'hooks/queries/useProjectsIpfsWithRewards';

import styles from './EpochResults.module.scss';
import EpochResultsProps from './types';

const EpochResults: FC<EpochResultsProps> = ({ projects, isLoading, epoch }) => {
  const [highlightedBarAddress, setHighlightedBarAddress] = useState<null | string>(null);
  const [startDraggingPageX, setStartDraggingPageX] = useState<number | null>(null);
  const [lastScrollLeft, setLastScrollLeft] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'right' | 'left'>('right');
  const { ipfsGateways } = env;
  const { isMobile, isTablet, isDesktop } = useMediaQuery();
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const details = projects.find(d => d.address === highlightedBarAddress);

  const getMaxValue = (): bigint => {
    const { matchedRewards, donations } = maxBy(projects, d => {
      if (d.donations > d.matchedRewards) {
        return d.donations;
      }
      return d.matchedRewards;
    }) as ProjectIpfsWithRewards;
    return matchedRewards > donations ? matchedRewards : donations;
  };

  const getBarHeightPercentage = (value: bigint) => {
    const maxValue = getMaxValue();
    if (!maxValue || !value) {
      return 0;
    }
    return (Number(value) / Number(maxValue)) * 100;
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!isScrollable || startDraggingPageX === null || !graphContainerRef.current) {
      return;
    }
    setIsDragging(true);
    const el = graphContainerRef.current;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    const difference = e.pageX + lastScrollLeft - startDraggingPageX;

    if (difference > 0 && lastScrollLeft <= maxScrollLeft) {
      el.scroll({ left: difference });
    }

    setScrollDirection(el.scrollLeft === maxScrollLeft ? 'left' : 'right');
  };

  useEffect(() => {
    if (isLoading || !graphContainerRef.current) {
      return;
    }
    const el = graphContainerRef.current;
    const isScrollableNext = el.scrollWidth > el.clientWidth;
    setIsScrollable(isScrollableNext);

    if (!isScrollableNext) {
      return;
    }
    const mouseUpListener = () => {
      setIsDragging(false);
      setStartDraggingPageX(null);
      setLastScrollLeft(graphContainerRef.current?.scrollLeft || 0);
    };

    document.addEventListener('mouseup', mouseUpListener);

    return () => {
      document.addEventListener('mouseup', mouseUpListener);
    };
  }, [isLoading, isMobile, isTablet, isDesktop]);

  useEffect(() => {
    if (isLoading && projects.length) {
      return;
    }
    const projectAddressToHighlight =
      projects[Math.ceil(Math.random() * (projects.length > 10 ? 10 : projects.length))]?.address;

    setHighlightedBarAddress(projectAddressToHighlight);

    const clickListener = e => {
      if (
        e.target.id === EPOCH_RESULTS_BAR_ID ||
        e.target.parentElement.id === EPOCH_RESULTS_BAR_ID
      ) {
        return;
      }

      setHighlightedBarAddress(null);
    };

    document.addEventListener('click', clickListener);

    return () => {
      document.removeEventListener('click', clickListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div className={styles.root}>
      <div
        ref={graphContainerRef}
        className={cx(styles.graphContainer, isLoading && styles.isLoading)}
        onMouseDown={e => {
          if (!isScrollable) {
            return;
          }
          setStartDraggingPageX(e.pageX);
        }}
        onMouseMove={onMouseMove}
        onScroll={() => {
          if (!isScrollable || isDragging || !graphContainerRef.current) {
            return;
          }
          const el = graphContainerRef.current;
          const maxScrollLeft = el.scrollWidth - el.clientWidth;
          setLastScrollLeft(el.scrollLeft);
          setScrollDirection(el.scrollLeft === maxScrollLeft ? 'left' : 'right');
        }}
      >
        {isLoading ? (
          <Img className={styles.image} src="/images/headphones_girl.webp" />
        ) : (
          <div className={styles.barsContainer}>
            {projects.map(({ address, matchedRewards, donations, profileImageSmall }) => (
              <EpochResultsBar
                key={`${address}__${epoch}`}
                address={address}
                bottomBarHeightPercentage={getBarHeightPercentage(donations)}
                imageSources={ipfsGateways
                  .split(',')
                  .map(element => `${element}${profileImageSmall}`)}
                isHighlighted={!!(highlightedBarAddress && highlightedBarAddress === address)}
                isLowlighted={!!(highlightedBarAddress && highlightedBarAddress !== address)}
                onClick={setHighlightedBarAddress}
                topBarHeightPercentage={getBarHeightPercentage(matchedRewards)}
              />
            ))}
          </div>
        )}
      </div>
      <EpochResultsDetails
        details={highlightedBarAddress ? details : undefined}
        epoch={epoch}
        isDragging={isDragging}
        isLoading={isLoading}
        isScrollable={isScrollable}
        scrollDirection={scrollDirection}
      />
    </div>
  );
};

export default EpochResults;
