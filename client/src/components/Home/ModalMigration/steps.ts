import { TFunction } from 'i18next';

type Step = {
  acknowledgment?: string;
  error?: string;
  imgPath: string;
  text: string;
  textConsent?: string;
  title: string;
};

export const getSteps = (t: TFunction): Step[] => [
  {
    imgPath: '/images/migration/migration.webp',
    text: 'components.migrationModal.steps.step1.text',
    title: t('steps.step1.title'),
  },
  {
    acknowledgment: t('steps.step2.acknowledgment'),
    error: t('steps.step2.error'),
    imgPath: '/images/migration/migration.webp',
    text: 'components.migrationModal.steps.step2.text',
    textConsent: 'components.migrationModal.steps.step2.consent',
    title: t('steps.step2.title'),
  },
];
