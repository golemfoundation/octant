import React, { ReactElement } from 'react';
import { Trans } from 'react-i18next';

import Img from 'components/ui/Img';
import Svg from 'components/ui/Svg';
import useCurrentEpoch from 'hooks/queries/useCurrentEpoch';
import useIsDecisionWindowOpen from 'hooks/queries/useIsDecisionWindowOpen';
import useEpochsIndexedBySubgraph from 'hooks/subgraph/useEpochsIndexedBySubgraph';
import { octantSemiTransparent } from 'svg/logo';

import styles from './SyncView.module.scss';

const SyncView = (): ReactElement => {
  const { data: isDecisionWindowOpn } = useIsDecisionWindowOpen();
  const { data: currentEpoch } = useCurrentEpoch();
  const { data: epochs } = useEpochsIndexedBySubgraph();

  return (
    <div className={styles.root} data-test="SyncView">
      <div style={{ color: 'black', fontSize: '120px' }}>
        {isDecisionWindowOpn ? 'true' : 'false'}
      </div>
      <div style={{ color: 'black', fontSize: '120px' }}>{currentEpoch}</div>
      <div style={{ color: 'black', fontSize: '120px' }}>{epochs}</div>
      <Svg img={octantSemiTransparent} size={6.4} />
      <Img className={styles.gif} src="images/tree.gif" />
      <Trans i18nKey="views.syncStatus.information" />
    </div>
  );
};

export default SyncView;
