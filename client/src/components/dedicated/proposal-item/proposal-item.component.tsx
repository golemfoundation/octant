import { useQuery } from 'react-query';
import React, { FC, Fragment } from 'react';

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
  const isVotingEnabled =
    getVotesCount !== undefined && vote !== undefined && currentEpoch !== undefined;

  const { data: numberOfVotes } = useQuery(
    ['numberOfVotes'],
    () => getVotesCount!(currentEpoch!, id),
    { enabled: isVotingEnabled },
  );

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
