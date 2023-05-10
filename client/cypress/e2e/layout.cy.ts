import { checkLocationWithLoader } from 'cypress/utils/e2e';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { navigationTabs } from 'src/constants/navigationTabs/navigationTabs';
import { ROOT } from 'src/routes/RootRoutes/routes';

describe('layout', () => {
  before(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    cy.visit(ROOT.absolute);
  });

  it('renders top bar', () => {
    cy.get('[data-test=Header__element]').should('be.visible');
  });

  it('renders bottom navbar', () => {
    cy.get('[data-test=Navigation__element]').should('be.visible');
  });

  it('bottom navbar allows to change views', () => {
    navigationTabs.forEach(({ label, to }) => {
      cy.get(`[data-test=${label}__Button]`).click();
      checkLocationWithLoader(to);
    });
  });
});
