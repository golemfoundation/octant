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

const EpochResults: FC<EpochResultsProps> = ({
  projects,
  isLoading,
  epoch,
  highlightedBarAddress,
  setHighlightedBarAddress,
}) => {
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

  const onMouseDown = (pageX: number) => {
    if (!isScrollable) {
      return;
    }
    setStartDraggingPageX(pageX);
  };

  const onMouseMove = (pageX: number) => {
    if (!isScrollable || startDraggingPageX === null || !graphContainerRef.current) {
      return;
    }
    setIsDragging(true);
    const el = graphContainerRef.current;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    const difference = pageX + lastScrollLeft - startDraggingPageX;

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
    const mouseUpTouchEndListener = () => {
      setIsDragging(false);
      setStartDraggingPageX(null);
      setLastScrollLeft(graphContainerRef.current?.scrollLeft || 0);
    };

    document.addEventListener('mouseup', mouseUpTouchEndListener);
    document.addEventListener('touchend', mouseUpTouchEndListener);

    return () => {
      document.addEventListener('mouseup', mouseUpTouchEndListener);
      document.removeEventListener('touchend', mouseUpTouchEndListener);
    };
  }, [isLoading, isMobile, isTablet, isDesktop]);

  useEffect(() => {
    if (isLoading && projects.length) {
      return;
    }

    const clickListener = e => {
      if (
        e.target?.id === EPOCH_RESULTS_BAR_ID ||
        e.target.parentElement?.id === EPOCH_RESULTS_BAR_ID ||
        !graphContainerRef.current ||
        highlightedBarAddress === null ||
        !isScrollable
      ) {
        return;
      }

      if (isMobile) {
        if (e.detail === 2) {
          setHighlightedBarAddress(null);
          return;
        }

        const { left, right } = graphContainerRef.current.getBoundingClientRect();
        const highlightedProjectIdx = projects.findIndex(
          project => project.address === highlightedBarAddress,
        );

        if (e.pageX < left && highlightedProjectIdx > 0) {
          setHighlightedBarAddress(projects[highlightedProjectIdx - 1].address);
          return;
        }

        if (e.pageX > right && highlightedProjectIdx < projects.length - 1) {
          setHighlightedBarAddress(projects[highlightedProjectIdx + 1].address);
        }
        return;
      }

      setHighlightedBarAddress(null);
    };

    document.addEventListener('click', clickListener);

    return () => {
      document.removeEventListener('click', clickListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isMobile, highlightedBarAddress, isScrollable]);

  useEffect(() => {
    if (isLoading || !projects.length || !graphContainerRef.current) {
      return;
    }

    const { width } = graphContainerRef.current.getBoundingClientRect();

    const barWidth = isDesktop ? 16 : 8;
    const barWidthWithMarginLeft = barWidth + (isDesktop ? 18 : 14);
    const numberOfVisibleBars = Math.floor((width - barWidth) / barWidthWithMarginLeft);

    const idxOfActiveBarToHighlight = Math.round(numberOfVisibleBars / 2) - 1;

    const projectAddressToHighlight =
      projects[
        idxOfActiveBarToHighlight > projects.length - 1
          ? projects.length - 1
          : idxOfActiveBarToHighlight
      ]?.address;

    setHighlightedBarAddress(projectAddressToHighlight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div className={styles.root}>
      <div
        ref={graphContainerRef}
        className={cx(styles.graphContainer, isLoading && styles.isLoading)}
        onDoubleClick={() => setHighlightedBarAddress(null)}
        onMouseDown={e => onMouseDown(e.pageX)}
        onMouseMove={e => onMouseMove(e.pageX)}
        onScroll={() => {
          if (!isScrollable || !graphContainerRef.current || isDragging || isMobile) {
            return;
          }
          const el = graphContainerRef.current;
          const maxScrollLeft = el.scrollWidth - el.clientWidth;
          setLastScrollLeft(el.scrollLeft);
          setScrollDirection(el.scrollLeft === maxScrollLeft ? 'left' : 'right');
        }}
        onTouchMove={e => {
          if (!isScrollable) {
            return;
          }
          e.stopPropagation();
          setIsDragging(true);
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
                epoch={epoch}
                imageSources={ipfsGateways
                  .split(',')
                  .map(element => `${element}${profileImageSmall}`)}
                isDragging={isDragging}
                isHighlighted={!!(highlightedBarAddress && highlightedBarAddress === address)}
                setHighlightedBarAddress={setHighlightedBarAddress}
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
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        scrollDirection={scrollDirection}
      />
    </div>
  );
};

export default EpochResults;
