import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import TipTile from 'components/shared/TipTile';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useTipsStore from 'store/tips/store';

import styles from './MetricsTipTile.module.scss';

const MetricsTipTile = (): ReactElement => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'views.metrics' });
  const { wasCheckStatusAlreadyClosed, setWasCheckStatusAlreadyClosed } = useTipsStore(state => ({
    setWasCheckStatusAlreadyClosed: state.setWasCheckStatusAlreadyClosed,
    wasCheckStatusAlreadyClosed: state.data.wasCheckStatusAlreadyClosed,
  }));

  const { data: currentEpoch } = useCurrentEpoch({
    refetchOnWindowFocus: true,
  });

  const { isDesktop } = useMediaQuery();
  const isCheckStatsTipVisible = !!currentEpoch && currentEpoch > 0 && !wasCheckStatusAlreadyClosed;

  return (
    <TipTile
      className={styles.tip}
      image={isDesktop ? 'images/tip-stats-hor.webp' : 'images/tip-stats-vert.webp'}
      infoLabel={i18n.t('common.octantTips')}
      isOpen={isCheckStatsTipVisible}
      onClose={() => setWasCheckStatusAlreadyClosed(true)}
      text={
        <Trans
          components={[<span className={styles.blackText} />]}
          i18nKey="views.metrics.tip.text"
        />
      }
      title={t('tip.title')}
    />
  );
};

export default MetricsTipTile;
