import { useQuery } from 'react-query';
import React, { FC, Fragment } from 'react';

import Button from 'components/core/button/button.component';
import Img from 'components/core/img/img.component';

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
        <Fragment>
          <div className={styles.header}>
            <div className={styles.imageLandscapeWrapper}>
              <Img
                className={styles.imageLandscape}
                src="https://via.placeholder.com/600x300.jpg/0000FF/FFFFFF"
              />
            </div>
            <Img
              className={styles.imageProfile}
              src="https://via.placeholder.com/64x64.jpg/000000/FFFFFF"
            />
          </div>
          <div className={styles.body}>
            <div className={styles.name}>{name}</div>
            <div className={styles.description}>{description}</div>
          </div>
          <div className={styles.footer}>
            <div className={styles.numbers}>
              <div className={styles.sum}>$5300</div>
              <div className={styles.percentage}>32%</div>
            </div>
            <div>
              <Button label="Add to Allocate" />
            </div>
          </div>
          {/* Below section is to be removed completely */}
          <div className={styles.debug}>
            Debug section:
            <div className={styles.buttons}>
              {vote && (
                <div>
                  Number of votes: {numberOfVotes}.
                  <Button label="Vote" onClick={() => vote(id, 100)} />
                </div>
              )}
              <Button href={website} label="Website" target="_blank" />
              {socialLinks.map((link, buttonIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <Button key={buttonIndex} href={link} label="Social link" target="_blank" />
              ))}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default ProposalItem;
