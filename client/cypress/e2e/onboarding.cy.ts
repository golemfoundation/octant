import { checkLocationWithLoader, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import steps from 'src/views/OnboardingView/steps';

import Chainable = Cypress.Chainable;

const connectWallet = (): Chainable<any> => {
  cy.disconnectMetamaskWalletFromAllDapps();
  visitWithLoader(ROOT.absolute);
  cy.get('[data-test=ConnectWalletButton]').click();
  cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
  cy.switchToMetamaskNotification();
  return cy.acceptMetamaskAccess();
};

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

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`onboarding: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.setupMetamask();
      cy.activateShowTestnetNetworksInMetamask();
      cy.changeMetamaskNetwork('sepolia');
    });

    beforeEach(() => {
      cy.clearLocalStorage();
      connectWallet();
      checkLocationWithLoader(ROOT_ROUTES.onboarding.absolute);
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
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
      cy.get('[data-test=InputToggle__AlwaysShowOnboarding]').check().should('be.checked');
      cy.reload();
      checkLocationWithLoader(ROOT_ROUTES.onboarding.absolute);
    });

    it('renders only once when "Always show Allocate onboarding" option is not checked', () => {
      cy.get('[data-test=OnboardingView__Modal__Button]').click();
      cy.get('[data-test=Settings__Button]').click();
      cy.get('[data-test=InputToggle__AlwaysShowOnboarding]').should('not.be.checked');
      cy.reload();
      checkLocationWithLoader(ROOT_ROUTES.settings.absolute);
    });
  });
});
