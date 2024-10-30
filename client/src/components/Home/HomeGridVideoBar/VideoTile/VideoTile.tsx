import Player from '@vimeo/player';
import cx from 'classnames';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import React, { forwardRef, Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { cross } from 'svg/misc';

import VideoTileProps from './types';
import styles from './VideoTile.module.scss';

const VideoTile = ({ title, url, isDragging }, ref) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridVideoBar',
  });
  const videoIframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player>();
  const previewVideoIframeRef = useRef<HTMLIFrameElement>(null);
  const previewPlayerRef = useRef<Player>();

  const isInViewRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(isInViewRef, { amount: 'all' });
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useMediaQuery();

  const urlWithOptions = `${url}&dnt=true`;
  const previewPlayerSrc = `${urlWithOptions}&muted=true&controls=false&size=640`;
  const playerSrc = `${urlWithOptions}&dnt=true&autoplay=true`;
  const [isVideoBoxOpen, setIsVideoBoxOpen] = useState(false);

  const [isCloseButtonExpanded, setIsCloseButtonExpanded] = useState(false);

  const onFullscreenChangeListener = () => {
    // eslint-disable-next-line  @typescript-eslint/naming-convention
    playerRef.current?.on('fullscreenchange', ({ fullscreen }) => {
      if (fullscreen || isLargeDesktop) {
        return;
      }
      playerRef.current?.off('fullscreenchange');
      setIsVideoBoxOpen(false);
      previewPlayerRef.current?.unload();
    });
  };

  useEffect(() => {
    if (!previewVideoIframeRef.current) {
      return;
    }
    previewPlayerRef.current = new Player(previewVideoIframeRef.current);
    previewPlayerRef.current.getVideoId().then(id => previewPlayerRef.current?.loadVideo(id));
  }, []);

  useEffect(() => {
    if (!videoIframeRef.current) {
      return;
    }
    playerRef.current?.off('fullscreenchange');
    if (isMobile) {
      playerRef.current?.getFullscreen().then(isFullscreen => {
        if (isFullscreen) {
          return;
        }
        playerRef.current?.requestFullscreen();
      });
    }

    onFullscreenChangeListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isTablet, isDesktop, isLargeDesktop]);

  return (
    <div
      ref={el => {
        if (!el) {
          return;
        }
        // @ts-expect-error wrong linter information that "current" is a read-only prop.
        isInViewRef.current = el;
        ref(el);
      }}
      className={cx(styles.root, isInView && styles.isInView)}
    >
      <div
        className={styles.previewVideoOverlay}
        onClick={() => {
          if (isDragging) {
            return;
          }
          setIsVideoBoxOpen(true);
        }}
        onMouseLeave={() => {
          previewPlayerRef.current?.unload();
        }}
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        onMouseOver={() => {
          previewPlayerRef.current?.play();
        }}
      />
      <iframe
        ref={previewVideoIframeRef}
        allow="autoplay; clipboard-write; encrypted-media; web-share;"
        className={styles.previewVideo}
        referrerPolicy="strict-origin-when-cross-origin"
        src={previewPlayerSrc}
        title={title}
      />
      {isVideoBoxOpen &&
        createPortal(
          <Fragment>
            {!isMobile && (
              <motion.div
                animate={{ opacity: 1 }}
                className={cx(styles.videoOverlay, styles.isOpen)}
                initial={{ opacity: 0 }}
                onClick={() => setIsVideoBoxOpen(false)}
              />
            )}
            <div className={styles.videoBox}>
              {!isMobile && (
                <motion.div
                  className={styles.closeButton}
                  initial={{ width: '4rem' }}
                  onClick={() => {
                    setIsVideoBoxOpen(false);
                    setIsCloseButtonExpanded(false);
                  }}
                  onMouseLeave={() => setIsCloseButtonExpanded(false)}
                  onMouseOver={() => setIsCloseButtonExpanded(true)}
                  whileHover={{
                    width: '14rem',
                  }}
                >
                  <AnimatePresence>
                    {isCloseButtonExpanded && (
                      <motion.div
                        animate={{ opacity: 1 }}
                        className={styles.closeButtonText}
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                      >
                        {t('closeVideoWithArrow')}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Svg img={cross} size={1} />
                </motion.div>
              )}
              <iframe
                ref={videoIframeRef}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
                allowFullScreen
                className={styles.video}
                onLoad={() => {
                  playerRef.current = new Player(videoIframeRef.current as HTMLIFrameElement);
                  if (isMobile) {
                    playerRef.current.requestFullscreen();
                  }
                  onFullscreenChangeListener();
                }}
                referrerPolicy="strict-origin-when-cross-origin"
                src={playerSrc}
                title={title}
              />
            </div>
          </Fragment>,
          document.body,
        )}
    </div>
  );
};

export default forwardRef<HTMLDivElement, VideoTileProps>(VideoTile);
