import cx from 'classnames';
import { format } from 'date-fns';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LinesEllipsis from 'react-lines-ellipsis';
import { useParams } from 'react-router-dom';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useGrantsPerProgram from 'hooks/queries/karmaGap/useMilestonesPerGrantPerProgram';
import { pending, completed } from 'svg/projectMilestones';

import styles from './ProjectMilestones.module.scss';
import ProjectMilestonesProps from './types';

const ProjectMilestones: FC<ProjectMilestonesProps> = ({ projectAddress }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.project.milestones' });
  const [filter, setFilter] = useState<'all' | 'pending' | 'complete'>('all');
  const { isMobile } = useMediaQuery();

  const { epoch } = useParams();

  const epochNumber = parseInt(epoch!, 10);

  const { data, isFetching } = useGrantsPerProgram(epochNumber, projectAddress);
  // eslint-disable-next-line no-console
  console.log({ data, isFetching, projectAddress });

  const getDateFormatted = (date: string | number): string => format(date, 'd LLL');

  if (isFetching) {
    return <div>Loading...</div>;
  }

  const states = [
    {
      filter: 'all',
      label: t('states.all'),
    },
    {
      filter: 'pending',
      icon: pending,
      label: t('states.pending'),
    },
    {
      filter: 'complete',
      icon: completed,
      label: t('states.complete'),
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {t('header')}
        <div className={styles.filters}>
          {states.map(({ filter: elementFilter, label, icon }) => {
            return (
              <div
                className={cx(styles.filter, elementFilter === filter && styles.isSelected)}
                onClick={() => setFilter(elementFilter as 'all' | 'pending' | 'complete')}
              >
                {icon && <Svg classNameSvg={styles.icon} img={icon} size={1.2} />}
                {(isMobile && !icon) || !isMobile ? label : null}
              </div>
            );
          })}
        </div>
      </div>
      {data?.milestones.map((element, index) => {
        const isCompleted = !!element?.completed;
        const isPending = !isCompleted;

        if ((filter === 'pending' && isCompleted) || (filter === 'complete' && isPending)) {
          return null;
        }

        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.milestone}>
            <div className={styles.timelineAndState}>
              {t('milestone')} {index + 1}{' '}
              <Svg classNameSvg={styles.icon} img={isCompleted ? completed : pending} size={1.2} />{' '}
              {getDateFormatted(element.createdAt)} {'->'}{' '}
              {getDateFormatted(element.data.endsAt * 1000)}
            </div>
            <div className={styles.title}>{element.data.title}</div>
            {isCompleted && (
              <div className={styles.description}>
                <div className={styles.date}>
                  {t('posted')} {getDateFormatted(element.completed.status.createdAt)}
                </div>
                <LinesEllipsis
                  ellipsis="..."
                  maxLine="3"
                  text={element.completed.status.data.reason}
                />
              </div>
            )}
          </div>
        );
      })}
      <Button
        className={styles.button}
        hasLinkArrow
        href={`https://gap.karmahq.xyz/project/${data?.project.details.data.slug}/grants/${data?.uid}/milestones-and-updates`}
        label={t('viewOnKarmaGap')}
        variant="secondary"
      />
    </div>
  );
};

export default ProjectMilestones;
