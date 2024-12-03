import i18n from 'i18n';

export type Milestone = {
  from: Date;
  href?: string;
  id: string;
  isAllocationWindowMilestone?: boolean;
  label: string;
  shouldUseThirdPersonSingularVerb?: boolean;
  to?: Date;
};

// LOOK AT ME
// Each milestone must have a date in the appropriate Europe/Warsaw time zone!
// Dates only in ISO8601 (Safari has troubles understanding other formats)
export default function getMilestones(): Milestone[] {
  // workaround for cypress test
  if (window.Cypress) {
    return [
      {
        from: new Date('2024-01-17T17:00:00+0100'),
        id: 'e3-epoch-starts',
        label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Three' }),
      },
      {
        from: new Date('2024-02-12T00:00:00+0100'),
        href: 'https://octant.fillout.com/t/u4uT8WFzDvus',
        id: 'e3-applications-open',
        label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
        to: new Date('2024-03-14T00:00:00+0100'),
      },
      {
        from: new Date('2024-03-17T00:00:00+0100'),
        id: 'e3-project-updates-close',
        label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
      },
      {
        from: new Date('2024-03-18T00:00:00+0100'),
        id: 'e3-snapshot-vote',
        label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
        shouldUseThirdPersonSingularVerb: true,
        to: new Date('2024-03-22T00:00:00+0100'),
      },
      {
        // 2024-03-31 timezone changes from UTC+00100 to UTC+00200.
        from: new Date('2024-04-16T18:00:00+0200'),
        id: 'e3-allocation-window',
        isAllocationWindowMilestone: true,
        label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
        shouldUseThirdPersonSingularVerb: true,
        to: new Date('2024-04-30T18:00:00+0200'),
      },
      {
        from: new Date('2024-04-16T18:00:00+0200'),
        id: 'e4-epoch-starts',
        label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Four' }),
      },
      {
        from: new Date('2024-05-13T00:00:00+0200'),
        href: 'https://octant.fillout.com/t/g9KoWncoD5us',
        id: 'e4-applications-open',
        label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
        to: new Date('2024-06-03T00:00:00+0200'),
      },
      {
        from: new Date('2024-06-07T00:00:00+0200'),
        id: 'e4-project-updates-close',
        label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
      },
      {
        from: new Date('2024-06-17T00:00:00+0200'),
        id: 'e4-snapshot-vote',
        label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
        shouldUseThirdPersonSingularVerb: true,
        to: new Date('2024-06-21T00:00:00+0200'),
      },
      {
        from: new Date(new Date().getTime() + 260 * 24 * 60 * 60 * 1000), // + 260 days
        id: 'e4-allocation-window',
        isAllocationWindowMilestone: true,
        label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
        shouldUseThirdPersonSingularVerb: true,
        to: new Date(new Date().getTime() + 284 * 24 * 60 * 60 * 1000), // + 284 days
      },
      {
        from: new Date('2024-07-15T18:00:00+0200'),
        id: 'e5-epoch-starts',
        label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Five' }),
      },
    ];
  }

  return [
    {
      from: new Date('2023-11-13T00:00:00+0100'),
      id: 'e2-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2023-12-20T00:00:00+0100'),
    },
    {
      from: new Date('2023-12-22T00:00:00+0100'),
      id: 'e2-project-updates-close',
      label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
    },
    {
      from: new Date('2024-01-01T00:00:00+0100'),
      id: 'e2-snapshot-vote',
      label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-01-05T00:00:00+0100'),
    },
    {
      from: new Date('2024-01-17T17:00:00+0100'),
      id: 'e2-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-01-31T17:00:00+0100'),
    },
    {
      from: new Date('2024-01-17T17:00:00+0100'),
      id: 'e3-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Three' }),
    },
    {
      from: new Date('2024-02-12T00:00:00+0100'),
      href: 'https://octant.fillout.com/t/u4uT8WFzDvus',
      id: 'e3-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2024-03-14T00:00:00+0100'),
    },
    {
      from: new Date('2024-03-17T00:00:00+0100'),
      id: 'e3-project-updates-close',
      label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
    },
    {
      from: new Date('2024-03-18T00:00:00+0100'),
      id: 'e3-snapshot-vote',
      label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-03-22T00:00:00+0100'),
    },
    {
      // 2024-03-31 timezone changes from UTC+00100 to UTC+00200.
      from: new Date('2024-04-16T18:00:00+0200'),
      id: 'e3-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-04-30T18:00:00+0200'),
    },
    {
      from: new Date('2024-04-16T18:00:00+0200'),
      id: 'e4-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Four' }),
    },
    {
      from: new Date('2024-05-13T00:00:00+0200'),
      href: 'https://octant.fillout.com/t/g9KoWncoD5us',
      id: 'e4-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2024-06-03T00:00:00+0200'),
    },
    {
      from: new Date('2024-06-07T00:00:00+0200'),
      id: 'e4-project-updates-close',
      label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
    },
    {
      from: new Date('2024-06-17T00:00:00+0200'),
      id: 'e4-snapshot-vote',
      label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-06-21T00:00:00+0200'),
    },
    {
      from: new Date('2024-07-15T18:00:00+0200'),
      id: 'e4-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-07-29T18:00:00+0200'),
    },
    {
      from: new Date('2024-07-15T18:00:00+0200'),
      id: 'e5-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Five' }),
    },
    {
      from: new Date('2024-08-01T00:00:00+0200'),
      href: 'https://octant.fillout.com/t/ok9Rz9pJBxus',
      id: 'e5-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2024-08-15T23:59:59+0200'),
    },
    {
      from: new Date('2024-08-15T23:59:59+0200'),
      id: 'e5-project-updates-close',
      label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
    },
    {
      from: new Date('2024-08-19T18:00:00+0200'),
      id: 'e5-snapshot-vote',
      label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-08-25T18:00:00+0200'),
    },
    {
      from: new Date('2024-10-13T18:00:00+0200'),
      id: 'e5-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-10-27T17:00:00+0100'),
    },
    {
      from: new Date('2024-10-13T18:00:00+0200'),
      id: 'e6-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Six' }),
    },
    // 2024-10-27 timezone changes from UTC+00200 to UTC+00100.
    {
      from: new Date('2024-11-18T17:00:00+0100'),
      id: 'e6-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2024-12-05T23:59:00+0100'),
    },
    {
      from: new Date('2024-12-10T23:59:00+0100'),
      id: 'e6-project-updates-close',
      label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
    },
    {
      from: new Date('2024-12-12T17:00:00+0100'),
      id: 'e6-snapshot-vote',
      label: i18n.t('views.projects.projectsTimelineWidget.snapshotVote'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2024-12-17T23:59:00+0100'),
    },
    {
      from: new Date('2025-01-11T17:00:00+0100'),
      id: 'e6-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2025-01-25T17:00:00+0100'),
    },
    {
      from: new Date('2025-01-11T17:00:00+0100'),
      id: 'e7-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 'Seven' }),
    },
  ];
}
