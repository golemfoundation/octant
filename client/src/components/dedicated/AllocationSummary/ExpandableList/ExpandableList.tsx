import { parseUnits } from 'ethers/lib/utils';
import React, { FC } from 'react';

import Img from 'components/core/Img/Img';
import Loader from 'components/core/Loader/Loader';
import env from 'env';
import useProposals from 'hooks/queries/useProposals';
import getFormattedEthValue from 'utils/getFormattedEthValue';

import styles from './ExpandableList.module.scss';
import ExpandableListProps from './types';

const ExpandableList: FC<ExpandableListProps> = ({ allocations, allocationValues }) => {
  const { ipfsGateway } = env;
  const { data: proposals } = useProposals();

  if (proposals.length === 0) {
    return <Loader />;
  }

  return (
    <div className={styles.projects}>
      {allocations!.map((addressInAllocation, index) => {
        const { name, profileImageCID } = proposals.find(
          ({ address }) => address === addressInAllocation,
        )!;
        const value = allocationValues[addressInAllocation];
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.projectRow}>
            <div className={styles.name}>
              <Img className={styles.imageProfile} src={`${ipfsGateway}${profileImageCID}`} />
              {name}
            </div>
            <div className={styles.sum}>
              {getFormattedEthValue(parseUnits((value as string) || '0')).fullString}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpandableList;
