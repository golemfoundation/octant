import React from 'react';

import stepOneImage from 'assets/images/onboarding/1.png';
import stepTwoImage from 'assets/images/onboarding/2.png';
import stepThreeImage from 'assets/images/onboarding/3.png';
import stepFourImage from 'assets/images/onboarding/4.png';
import Button from 'components/core/Button/Button';
import { DISCORD_INVITE_LINK, HEXAGON_DOCS, BLOG_POST } from 'constants/urls';

import styles from './OnboardingView.module.scss';
import { Step } from './types';

const steps: Step[] = [
  {
    header: 'Welcome to Hexagon',
    image: stepOneImage,
    text: (
      <div>
        Hexagon is a Golem Foundation experiment in decentralised governance and funding projects
        for the public good.
        <br />
        <br />
        To get started, connect your wallet and lock some GLM in the Earn tab. If you don’t have any
        GLM or you want to know more about locking, this{' '}
        <Button href={BLOG_POST} variant="link3">
          blog post
        </Button>{' '}
        has all you need to know to get started.
      </div>
    ),
  },
  {
    header: 'Staking rewards',
    image: stepTwoImage,
    text: (
      <div>
        If you lock more than 100 GLM, you will earn rewards in ETH for every epoch you have tokens
        locked. Tokens can be unlocked at any time.
        <br />
        <br />
        You can choose to withdraw your earnings or allocate them to public good projects, which you
        can browse in the <span className={styles.bold}>Projects</span> tab.
      </div>
    ),
  },
  {
    header: 'Allocate or Withdraw',
    image: stepThreeImage,
    text: (
      <div>
        Projects you shortlist for allocation will appear here in the{' '}
        <span className={styles.bold}>Allocate</span> tab. You can allocate some, or all of your ETH
        rewards.
        <br />
        <br />
        Rewards allocated will have Golem Foundation match funding applied, so donating will
        multiply the impact of your earnings compared to withdrawing it.
      </div>
    ),
  },
  {
    header: 'More information',
    image: stepFourImage,
    text: (
      <div>
        The <span className={styles.bold}>Metrics</span> tab shows a range of stats about the
        current and previous epochs to help inform your allocation decisions and generally provide
        an overview of Hexagon.
        <br />
        <br />
        Still have questions or want to reach out?
        <br />
        Read the{' '}
        <Button href={HEXAGON_DOCS} variant="link3">
          Docs
        </Button>{' '}
        or join us on{' '}
        <Button href={DISCORD_INVITE_LINK} variant="link3">
          Discord
        </Button>
        .
      </div>
    ),
  },
];

export default steps;
