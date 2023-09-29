import React, { ReactElement } from 'react';
import { Trans } from 'react-i18next';

import Img from 'components/core/Img/Img';
import Svg from 'components/core/Svg/Svg';
import { octantSemiTransparent } from 'svg/logo';

import styles from './SyncView.module.scss';

const SyncView = (): ReactElement => (
  <div className={styles.root}>
    <Svg img={octantSemiTransparent} size={6.4} />
    <Img className={styles.gif} src="images/tree.gif" />
    <Trans i18nKey="views.syncStatus.information" />
  </div>
);

export default SyncView;
