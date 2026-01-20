import { TFunction } from 'i18next';

type Step = {
  imgPath: string;
  text: string;
  title: string;
};

export const getSteps = (t: TFunction): Step[] => [
  {
    imgPath: '/images/migration/migration.webp',
    text: 'components.migrationModal.steps.step1.text',
    title: t('steps.step1.title'),
  },
  {
    imgPath: '/images/migration/migration.webp',
    text: 'components.migrationModal.steps.step2.text',
    title: t('steps.step2.title'),
  },
];
