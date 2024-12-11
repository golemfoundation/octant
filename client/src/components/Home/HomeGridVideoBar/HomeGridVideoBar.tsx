import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import VideoTile from 'components/Home/HomeGridVideoBar/VideoTile';
import GridTile from 'components/shared/Grid/GridTile';
import NavigationArrows from 'components/shared/NavigationArrows';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useVimeoVideos from 'hooks/queries/useVimeoVideos';
import useSettingsStore from 'store/settings/store';
import { cross } from 'svg/misc';

import styles from './HomeGridVideoBar.module.scss';
import HomeGridVideoBarProps from './types';

const HomeGridVideoBar: FC<HomeGridVideoBarProps> = ({ className }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridVideoBar',
  });
  const x = useMotionValue(0);
  const { isMobile, isTablet } = useMediaQuery();
  const { data } = useVimeoVideos();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const videosWrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const tilesRef = useRef<HTMLDivElement[]>([]);
  const [isNextButtonActive, setIsNextButtonActive] = useState(false);
  const [isPrevButtonActive, setIsPrevButtonActive] = useState(false);
  const containerBoundingClientRect = constraintsRef.current?.getBoundingClientRect();
  const videosWrapperBoundingClientRect = videosWrapperRef.current?.getBoundingClientRect();
  const containerLeft = containerBoundingClientRect?.left ?? 0;
  const containerWidth = containerBoundingClientRect?.width ?? 0;
  const videosWrapperWidth = videosWrapperBoundingClientRect?.width ?? 0;
  const maxMotionValue = videosWrapperWidth - containerWidth;
  const tilesGap = 24;
  const tileWidth = isMobile || isTablet ? 280 : 392;

  const { setShowHelpVideos } = useSettingsStore(state => ({
    setShowHelpVideos: state.setShowHelpVideos,
  }));

  useMotionValueEvent(x, 'change', nextX => {
    setIsPrevButtonActive(nextX < 0);
    setIsNextButtonActive(Math.ceil(Math.abs(nextX)) < maxMotionValue);
  });

  const moveVideoBar = (isPrev?: boolean) => {
    if (!constraintsRef.current || !videosWrapperRef.current) {
      return;
    }

    const amountOfVisibleTiles = Math.floor(containerWidth / (tileWidth + tilesGap));
    const numberOfHiddenTilesLeft = Math.ceil(Math.abs(x.get()) / (tileWidth + tilesGap));
    const numberOfHiddenTilesRight = Math.ceil(
      Math.abs(x.get() + maxMotionValue) / (tileWidth + tilesGap),
    );

    const nextActiveTileIdx = isPrev
      ? Math.max(0, numberOfHiddenTilesLeft - amountOfVisibleTiles)
      : data!.length - numberOfHiddenTilesRight;

    const { left: tileLeft } = tilesRef.current[nextActiveTileIdx].getBoundingClientRect()!;

    const motionValue =
      x.get() +
      ((isPrev ? tileLeft - tilesGap < containerLeft : tileLeft + tilesGap > containerLeft)
        ? -tileLeft + tilesGap + containerLeft
        : 0);

    const motionValueToSet = motionValue < -maxMotionValue ? -maxMotionValue : motionValue;

    x.set(motionValueToSet);
  };

  useEffect(() => {
    if (!constraintsRef.current || !videosWrapperRef.current || !data?.length) {
      return;
    }
    const { width: containerInitialWidth } = constraintsRef.current!.getBoundingClientRect();
    const { width: videosWrapperInitialWidth } = videosWrapperRef.current!.getBoundingClientRect();

    setIsNextButtonActive(videosWrapperInitialWidth > containerInitialWidth);
  }, [data?.length]);

  const navigationArrowsProps = {
    className: styles.arrows,
    classNamePrevButton: styles.arrowLeft,
    isNextButtonDisabled: !isNextButtonActive,
    isPrevButtonDisabled: !isPrevButtonActive,
    onClickNextButton: () => moveVideoBar(),
    onClickPrevButton: () => moveVideoBar(true),
  };

  return (
    <GridTile
      className={className}
      dataTest="HomeGridVideoBar"
      title={t('learnHowToUseOctant')}
      titleSuffix={
        <>
          {!isMobile && <NavigationArrows {...navigationArrowsProps} />}
          <Button
            className={styles.buttonClose}
            Icon={<Svg img={cross} size={0.8} />}
            onClick={() => setShowHelpVideos(false)}
            variant="iconOnly"
          />
        </>
      }
    >
      <div ref={constraintsRef} className={styles.constraintsWrapper}>
        <motion.div
          ref={videosWrapperRef}
          className={styles.videosWrapper}
          drag="x"
          dragConstraints={constraintsRef}
          onDragEnd={() => setIsDragging(false)}
          onDragStart={() => setIsDragging(true)}
          style={{ x }}
        >
          {data?.map(({ name, player_embed_url }, idx) => (
            <VideoTile
              key={player_embed_url}
              ref={el => {
                if (!el) {
                  return;
                }
                tilesRef.current[idx] = el;
                return el;
              }}
              isDragging={isDragging}
              style={
                isMobile && idx + 1 === data?.length
                  ? { marginRight: containerWidth - 2 * tilesGap - tileWidth }
                  : undefined
              }
              title={name}
              url={player_embed_url}
            />
          ))}
        </motion.div>
      </div>
      {isMobile && <NavigationArrows {...navigationArrowsProps} />}
    </GridTile>
  );
};

export default HomeGridVideoBar;
