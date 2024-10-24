import MarkdownPreview from '@uiw/react-markdown-preview';
import cx from 'classnames';
import { format } from 'date-fns';
import React, { FC, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import ProjectMilestonesNoResults from 'components/Project/ProjectMilestonesNoResults';
import ProjectMilestonesSkeleton from 'components/Project/ProjectMilestonesSkeleton';
import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import useGrantsPerProgram from 'hooks/queries/karmaGap/useMilestonesPerGrantPerProgram';
import { pending, completed } from 'svg/projectMilestones';

import styles from './ProjectMilestones.module.scss';
import ProjectMilestonesProps from './types';

const MILESTONE_MAX_HEIGHT_CLIPPED = 110; // pixels.

const ProjectMilestones: FC<ProjectMilestonesProps> = ({ projectAddress }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'views.project.milestones' });
  const milestonesRefs = useRef([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'complete'>('all');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string>('');
  const [milestonesExpandable, setMilestonesExpandable] = useState<string[]>([]);
  const { isMobile } = useMediaQuery();

  const { epoch } = useParams();

  const epochNumber = parseInt(epoch!, 10);

  const { data, isFetching } = useGrantsPerProgram(epochNumber, projectAddress);

  const getDateFormatted = (date: string | number): string => format(date, 'd LLL');

  useEffect(() => {
    if (isFetching) {
      return;
    }
    Object.keys(milestonesRefs.current).forEach(elementKey => {
      const { clientHeight } = milestonesRefs.current[elementKey];
      if (clientHeight > MILESTONE_MAX_HEIGHT_CLIPPED) {
        setMilestonesExpandable(prevState => {
          if (prevState.includes(elementKey)) {
            return prevState;
          }
          return [...prevState, elementKey];
        });
      }
    });
  }, [isFetching]);

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

  const areMilestonesAvailable = !isFetching && data !== undefined;

  return (
    <div className={cx(styles.root, isFetching && styles.isFetching)}>
      <div className={styles.header}>
        {t('header')}
        {areMilestonesAvailable ? (
          <div className={styles.filters}>
            {states.map(({ filter: elementFilter, label, icon }) => {
              return (
                <div
                  key={elementFilter}
                  className={cx(styles.filter, elementFilter === filter && styles.isSelected)}
                  onClick={() => setFilter(elementFilter as 'all' | 'pending' | 'complete')}
                >
                  {icon && <Svg classNameSvg={styles.icon} img={icon} size={1.2} />}
                  {(isMobile && !icon) || !isMobile ? label : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.filtersNoMilestones}>No milestones yet</div>
        )}
      </div>
      {!isFetching && (data === undefined || data.milestones.length === 0) && (
        <ProjectMilestonesNoResults />
      )}
      {isFetching &&
        data === undefined &&
        [...Array(5).keys()].map(element => (
          <ProjectMilestonesSkeleton key={element} className={styles.milestone} />
        ))}
      {areMilestonesAvailable &&
        data?.milestones.slice(0, 5).map((element, index) => {
          const isCompleted = !!element?.completed;
          const isPending = !isCompleted;
          const isExpandable = milestonesExpandable.includes(element.uid);
          const isExpanded = expandedMilestoneId === element.uid;

          if ((filter === 'pending' && isCompleted) || (filter === 'complete' && isPending)) {
            return null;
          }

          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={styles.milestone}>
              <div className={styles.timelineAndState}>
                {t('milestone')} {index + 1}{' '}
                <Svg
                  classNameSvg={styles.icon}
                  img={isCompleted ? completed : pending}
                  size={1.2}
                />{' '}
                {getDateFormatted(element.createdAt)} {'->'}{' '}
                {getDateFormatted(element.data.endsAt * 1000)}
              </div>
              <div className={styles.title}>{element.data.title}</div>
              <div
                /* eslint-disable no-return-assign */
                ref={div => {
                  if (div === null) {
                    return;
                  }
                  /* @ts-expect-error hacky bypass of div assignment to ref */
                  milestonesRefs.current[element.uid] = div;
                }}
                /* eslint-enable no-return-assign */
                className={cx(
                  styles.body,
                  isExpandable && styles.isExpandable,
                  isExpanded && styles.isExpanded,
                )}
              >
                <div className={styles.description}>
                  <MarkdownPreview
                    source={element.data.description}
                    /* eslint-disable-next-line @typescript-eslint/naming-convention */
                    wrapperElement={{ 'data-color-mode': 'light' }}
                  />
                </div>
                {isCompleted && (
                  <div className={styles.description}>
                    <div className={styles.date}>
                      {t('posted')} {getDateFormatted(element.completed.status.createdAt)}
                    </div>
                    <MarkdownPreview
                      source={element.completed.status.data.reason}
                      /* eslint-disable-next-line @typescript-eslint/naming-convention */
                      wrapperElement={{ 'data-color-mode': 'light' }}
                    />
                  </div>
                )}
                {isExpandable && !isExpanded && <div className={styles.blur} />}
              </div>
              {isExpandable && (
                <Button
                  className={styles.buttonExpand}
                  label={isExpanded ? t('buttonExpand.readLess') : t('buttonExpand.readMore')}
                  onClick={
                    isExpanded
                      ? () => setExpandedMilestoneId('')
                      : () => setExpandedMilestoneId(element.uid)
                  }
                  variant="link3"
                />
              )}
            </div>
          );
        })}
      {areMilestonesAvailable && (
        <Button
          className={styles.buttonViewKarma}
          hasLinkArrow
          href={`https://gap.karmahq.xyz/project/${data?.project.details.data.slug}/grants/${data?.uid}/milestones-and-updates#all`}
          label={t('viewOnKarmaGap')}
          variant="secondary"
        />
      )}
    </div>
  );
};

export default ProjectMilestones;
