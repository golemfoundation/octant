import React, { FC, Fragment, useEffect, useState } from 'react';

import Button from 'components/core/button/button.component';

import { ProposalItemProps } from './types';
import styles from './style.module.scss';

const ProposalItem: FC<ProposalItemProps> = ({
  id,
  description,
  isLoadingError,
  name,
  contractAllocations,
  socialLinks,
  website,
}) => {
  const [numberOfVotes, setNumberOfVotes] = useState<number | undefined>(undefined);
  const isContractAllocationsAvailable = contractAllocations !== null;

  useEffect(() => {
    if (isContractAllocationsAvailable) {
      (async () => {
        // TODO GE-36: remove contractAllocations from ProposalItem, pass used methods only.
        // TODO GE-36: add dynamic epoch number.
        contractAllocations!.getVotesCount(1, id).then(value => {
          setNumberOfVotes(value);
        });
      })();
    }
  }, [isContractAllocationsAvailable, id, contractAllocations]);

  return (
    <div className={styles.root}>
      {isLoadingError ? (
        'Loading of proposal encountered an error.'
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment>
          <div>{name}</div>
          <div>{description}</div>
          {contractAllocations && (
            <div>
              Number of votes: {numberOfVotes}.
              <Button label="Vote" onClick={() => contractAllocations.vote(id, 100)} />
            </div>
          )}
          <div>
            <Button href={website} label="Website" target="_blank" />
          </div>
          <div className={styles.buttons}>
            {socialLinks.map((link, buttonIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <Button key={buttonIndex} href={link} label="Social link" target="_blank" />
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default ProposalItem;
