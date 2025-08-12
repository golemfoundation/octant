import i18n from 'i18n';

export type Milestone = {
  from: Date;
  href?: string;
  id: string;
  isAllocationWindowMilestone?: boolean;
  isHourVisible?: boolean;
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
        label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 3 }),
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
        label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 4 }),
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
        label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 5 }),
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
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 3 }),
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
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 4 }),
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
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 5 }),
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
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 6 }),
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
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 7 }),
    },
    {
      from: new Date('2025-01-30T00:00:00+0100'),
      href: 'https://octant.fillout.com/epoch-7-climate-round-applications',
      id: 'e7-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2025-02-14T08:59+0100'), // February 13, 11:59 pm PST
    },
    {
      from: new Date('2025-04-11T18:00:00+0200'),
      id: 'e7-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2025-04-25T18:00:00+0200'),
    },
    {
      from: new Date('2025-05-22T00:00:00+0100'),
      href: 'https://octant.fillout.com/epoch8-applications',
      id: 'e8-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      // June 3 11:59 pm PST
      to: new Date('2025-06-04T08:59:00+0100'),
    },
    {
      from: new Date('2025-06-16T23:59:00+0100'),
      id: 'e8-project-updates-close',
      isHourVisible: false,
      label: i18n.t('views.projects.projectsTimelineWidget.projectUpdatesClose'),
    },
    {
      from: new Date('2025-07-10T18:00:00+0200'),
      id: 'e8-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2025-07-24T18:00:00+0200'),
    },
    {
      from: new Date('2025-07-10T17:00:00+0100'),
      id: 'e9-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 9 }),
    },
    {
      from: new Date('2025-08-18T20:00:00+0100'),
      href: 'CHANGE ME',
      id: 'e9-applications-open',
      label: i18n.t('views.projects.projectsTimelineWidget.applicationsOpen'),
      to: new Date('2025-08-27T20:00:00+0100'),
    },
    {
      from: new Date('2025-09-01T00:00:00+0100'),
      id: 'e9-internal-review-and-selection',
      label: i18n.t('views.projects.projectsTimelineWidget.internalReviewAndSelection'),
      to: new Date('2025-09-10T23:59:59+0100'),
    },
    {
      from: new Date('2025-10-08T17:00:00+0200'),
      id: 'e9-allocation-window',
      isAllocationWindowMilestone: true,
      label: i18n.t('views.projects.projectsTimelineWidget.allocationWindow'),
      shouldUseThirdPersonSingularVerb: true,
      to: new Date('2025-10-22T18:00:00+0200'),
    },
    {
      from: new Date('2025-10-08T17:00:00+0200'),
      id: 'e10-epoch-starts',
      label: i18n.t('views.projects.projectsTimelineWidget.epochStarts', { epoch: 10 }),
    },
  ];
}
