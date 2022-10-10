import React, { FC, Fragment, useEffect, useState } from 'react';

import Button from 'components/core/button/button.component';

import { ProposalItemProps } from './types';
import styles from './style.module.scss';

const ProposalItem: FC<ProposalItemProps> = ({
  currentEpoch,
  description,
  getVotesCount,
  id,
  isLoadingError,
  name,
  socialLinks,
  vote,
  website,
}) => {
  const [numberOfVotes, setNumberOfVotes] = useState<number | undefined>(undefined);
  const isVotingEnabled =
    typeof getVotesCount !== 'undefined' &&
    typeof vote !== 'undefined' &&
    typeof currentEpoch !== 'undefined';

  useEffect(() => {
    if (isVotingEnabled) {
      (async () => {
        getVotesCount!(currentEpoch!, id).then(value => {
          setNumberOfVotes(value);
        });
      })();
    }
  }, [isVotingEnabled, currentEpoch, getVotesCount, id]);

  return (
    <div className={styles.root}>
      {isLoadingError ? (
        'Loading of proposal encountered an error.'
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment>
          <div>{name}</div>
          <div>{description}</div>
          {vote && (
            <div>
              Number of votes: {numberOfVotes}.
              <Button label="Vote" onClick={() => vote(id, 100)} />
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
