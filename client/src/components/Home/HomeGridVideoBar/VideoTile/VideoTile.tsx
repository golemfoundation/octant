import Player from '@vimeo/player';
import cx from 'classnames';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import React, { FC, Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import Svg from 'components/ui/Svg';
import { cross } from 'svg/misc';

import VideoTileProps from './types';
import styles from './VideoTile.module.scss';

const VideoTile: FC<VideoTileProps> = ({ title, url, isDragging }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridVideoBar',
  });
  const ref = useRef(null);
  const previewVideoIframeRef = useRef(null);
  const previewPlayerRef = useRef<Player>();
  const isInView = useInView(ref, { amount: 'all' });

  const urlWithOptions = `${url}&dnt=true`;
  const previewPlayerSrc = `${urlWithOptions}&muted=true&controls=false&size=640`;
  const playerSrc = `${urlWithOptions}&dnt=true&autoplay=true`;
  const [isVideoBoxOpen, setIsVideoBoxOpen] = useState(false);

  const [isCloseButtonExpanded, setIsCloseButtonExpanded] = useState(false);

  useEffect(() => {
    if (!previewVideoIframeRef.current) {
      return;
    }
    const player = new Player(previewVideoIframeRef.current);
    previewPlayerRef.current = player;

    previewPlayerRef.current.getVideoId().then(id => previewPlayerRef.current?.loadVideo(id));
  }, []);

  return (
    <div ref={ref} className={cx(styles.root, isInView && styles.isInView)}>
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
            <motion.div
              animate={{ opacity: 1 }}
              className={cx(styles.videoOverlay, styles.isOpen)}
              initial={{ opacity: 0 }}
              onClick={() => setIsVideoBoxOpen(false)}
            />
            <div className={styles.videoBox}>
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
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
                allowFullScreen
                className={styles.video}
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

export default VideoTile;
