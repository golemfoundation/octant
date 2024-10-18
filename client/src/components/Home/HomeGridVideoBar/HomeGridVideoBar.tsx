import { motion } from 'framer-motion';
import React, { FC, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import VideoTile from 'components/Home/HomeGridVideoBar/VideoTile';
import GridTile from 'components/shared/Grid/GridTile';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useVimeoVideos from 'hooks/queries/useVimeoVideos';
import useSettingsStore from 'store/settings/store';
import { cross } from 'svg/misc';

import styles from './HomeGridVideoBar.module.scss';
import HomeGridVideoBarProps from './types';

const HomeGridVideoBar: FC<HomeGridVideoBarProps> = ({ className }) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'components.home.homeGridVideoBar',
  });
  const { data } = useVimeoVideos();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const { setShowHelpVideos } = useSettingsStore(state => ({
    setShowHelpVideos: state.setShowHelpVideos,
  }));

  return (
    <GridTile
      className={className}
      title={t('learnHowToUseOctant')}
      titleSuffix={
        <Button
          className={styles.buttonClose}
          Icon={<Svg img={cross} size={0.8} />}
          onClick={() => setShowHelpVideos(false)}
          variant="iconOnly"
        />
      }
    >
      <div ref={constraintsRef} className={styles.constraintsWrapper}>
        <motion.div className={styles.videosWrapper} drag="x" dragConstraints={constraintsRef}>
          {data?.map(({ name, player_embed_url, user }) => (
            <VideoTile
              key={player_embed_url}
              author={user.name}
              title={name}
              url={player_embed_url}
            />
          ))}
        </motion.div>
      </div>
    </GridTile>
  );
};

export default HomeGridVideoBar;
