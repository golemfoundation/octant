import { checkLocationWithLoader, visitWithLoader } from 'cypress/utils/e2e';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import steps from 'src/views/OnboardingView/steps';

import Chainable = Cypress.Chainable;

const checkProgressStepperSlimIsCurrentAndClickNext = (index): Chainable<any> => {
  cy.get('[data-test=OnboardingView__ProgressStepperSlim__element]')
    .eq(index)
    .invoke('attr', 'data-iscurrent')
    .should('eq', 'true');
  return cy
    .get('[data-test=OnboardingView__ProgressStepperSlim__element]')
    .eq(index + 1)
    .click();
};

describe('onboarding', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    visitWithLoader(ROOT.absolute, ROOT_ROUTES.onboarding.absolute);
  });

  it('user is able to click through entire onboarding flow', () => {
    for (let i = 0; i < steps.length - 1; i++) {
      checkProgressStepperSlimIsCurrentAndClickNext(i);
    }

    cy.get('[data-test=OnboardingView__ProgressStepperSlim__element]')
      .eq(steps.length - 1)
      .click();
    cy.get('[data-test=ProposalsView__List]').should('be.visible');
  });

  it('user is able to close the modal by clicking button in the top-right', () => {
    cy.get('[data-test=OnboardingView__Modal__Button]').click();
    cy.get('[data-test=ProposalsView__List]').should('be.visible');
  });

  it('renders every time page is refreshed when "Always show Allocate onboarding" option is checked', () => {
    cy.get('[data-test=OnboardingView__Modal__Button]').click();
    cy.get('[data-test=Settings__Button]').click();
    cy.get('[data-test=AlwaysShowOnboarding__InputCheckbox]').check().should('be.checked');
    cy.reload();
    checkLocationWithLoader(ROOT_ROUTES.onboarding.absolute);
  });

  it('renders only once when "Always show Allocate onboarding" option is not checked', () => {
    cy.get('[data-test=OnboardingView__Modal__Button]').click();
    cy.get('[data-test=Settings__Button]').click();
    cy.get('[data-test=AlwaysShowOnboarding__InputCheckbox]').should('not.be.checked');
    cy.reload();
    checkLocationWithLoader(ROOT_ROUTES.settings.absolute);
  });
});
