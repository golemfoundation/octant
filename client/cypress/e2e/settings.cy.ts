import { visitWithLoader } from 'cypress/utils/e2e';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

describe('settings', () => {
  before(() => {
    cy.clearAllLocalStorage();
  });

  beforeEach(() => {
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    visitWithLoader(ROOT_ROUTES.settings.absolute);
  });

  it('"Always show Allocate onboarding" option toggle works', async () => {
    const onboardingToggle = cy.get('[data-test=AlwaysShowOnboarding__InputCheckbox]');

    onboardingToggle.check();
    onboardingToggle.should('be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
    });

    onboardingToggle.click();
    onboardingToggle.should('not.be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('false');
    });

    onboardingToggle.click();
    onboardingToggle.should('be.checked');
    cy.getAllLocalStorage().then(() => {
      expect(localStorage.getItem(IS_ONBOARDING_ALWAYS_VISIBLE)).eq('true');
    });
  });
});
