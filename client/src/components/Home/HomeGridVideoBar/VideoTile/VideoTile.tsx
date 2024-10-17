import Player from '@vimeo/player';
import cx from 'classnames';
import { useInView } from 'framer-motion';
import React, { FC, useRef } from 'react';

import VideoTileProps from './types';
import styles from './VideoTile.module.scss';

const VideoTile: FC<VideoTileProps> = ({ title, author, url }) => {
  const ref = useRef(null);
  const playerRef = useRef<Player>();
  const isInView = useInView(ref, { amount: 'all' });

  // https://developer.vimeo.com/player/sdk/embed
  const urlWithOptions = `${url}&dnt=true&muted=true`;

  return (
    <div ref={ref} className={cx(styles.root, isInView && styles.isInView)}>
      <iframe
        ref={iframeRef => {
          if (!iframeRef) {
            return;
          }
          const player = new Player(iframeRef);
          playerRef.current = player;

          // workaround to skip thumbnail
          player.on('loaded', () => {
            player.play().then(() => {
              player.pause().then(() => {
                player.setMuted(false);
              });
            });
          });
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
        allowFullScreen
        className={styles.video}
        referrerPolicy="strict-origin-when-cross-origin"
        src={urlWithOptions}
        title={title}
      />
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>{author}</div>
      </div>
    </div>
  );
};

export default VideoTile;
