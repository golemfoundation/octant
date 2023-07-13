import { visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import steps from 'src/components/dedicated/ModalOnboarding/steps';
import { ROOT } from 'src/routes/RootRoutes/routes';

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
  cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
    .eq(index - 1)
    .invoke('attr', 'data-iscurrent')
    .should('eq', 'true');
  return cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]').eq(index).click();
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`onboarding: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
      cy.setupMetamask();
      cy.activateShowTestnetNetworksInMetamask();
      cy.changeMetamaskNetwork('sepolia');
      window.innerWidth = Cypress.config().viewportWidth;
      window.innerHeight = Cypress.config().viewportHeight;
    });

    beforeEach(() => {
      connectWallet();
    });

    it('user is able to click through entire onboarding flow', () => {
      for (let i = 1; i < steps.length - 1; i++) {
        checkProgressStepperSlimIsCurrentAndClickNext(i);
      }

      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(steps.length - 1)
        .click();
      cy.get('[data-test=ProposalsView__List]').should('be.visible');
    });

    it('user is able to close the modal by clicking button in the top-right', () => {
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
      cy.get('[data-test=ProposalsView__List]').should('be.visible');
    });

    it('renders every time page is refreshed when "Always show Allocate onboarding" option is checked', () => {
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=Navbar__Button--Settings]').click();
      cy.get('[data-test=InputToggle__AlwaysShowOnboarding]').check().should('be.checked');
      cy.reload();
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
    });

    it('renders only once when "Always show Allocate onboarding" option is not checked', () => {
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=Navbar__Button--Settings]').click();
      cy.get('[data-test=InputToggle__AlwaysShowOnboarding]').should('not.be.checked');
      cy.reload();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
    });

    it('user can change steps with arrow keys (left, right)', () => {
      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(0)
        .invoke('attr', 'data-iscurrent')
        .should('eq', 'true');

      [
        { el: 1, key: 'ArrowRight' },
        { el: 2, key: 'ArrowRight' },
        { el: 3, key: 'ArrowRight' },
        { el: 3, key: 'ArrowRight' },
        { el: 2, key: 'ArrowLeft' },
        { el: 1, key: 'ArrowLeft' },
        { el: 0, key: 'ArrowLeft' },
        { el: 0, key: 'ArrowLeft' },
      ].forEach(({ key, el }) => {
        cy.get('body').trigger('keydown', { key });
        cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
          .eq(el)
          .invoke('attr', 'data-iscurrent')
          .should('eq', 'true');
      });
    });

    it('user can change steps by touching the edge of the screen (up to 15px from each edge)', () => {
      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(0)
        .invoke('attr', 'data-iscurrent')
        .should('eq', 'true');

      [
        { clientX: window.innerWidth - 15, el: 1 },
        { clientX: window.innerWidth - 10, el: 2 },
        { clientX: window.innerWidth - 5, el: 3 },
        { clientX: window.innerWidth, el: 3 },
        { clientX: 15, el: 2 },
        { clientX: 10, el: 1 },
        { clientX: 5, el: 0 },
        { clientX: 0, el: 0 },
      ].forEach(({ clientX, el }) => {
        cy.get('[data-test=ModalOnboarding]').trigger('touchstart', { touches: [{ clientX }] });
        cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
          .eq(el)
          .invoke('attr', 'data-iscurrent')
          .should('eq', 'true');
      });
    });

    it('user cannot change steps by touching the edge of the screen (more than 15px from each edge)', () => {
      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(0)
        .invoke('attr', 'data-iscurrent')
        .should('eq', 'true');

      [
        { clientX: window.innerWidth - 15, el: 1 },
        { clientX: window.innerWidth - 16, el: 1 },
        { clientX: 16, el: 1 },
        { clientX: 15, el: 0 },
      ].forEach(({ clientX, el }) => {
        cy.get('[data-test=ModalOnboarding]').trigger('touchstart', { touches: [{ clientX }] });
        cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
          .eq(el)
          .invoke('attr', 'data-iscurrent')
          .should('eq', 'true');
      });
    });

    it('user can change steps by swiping on screen (difference more than or equal 5px)', () => {
      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(0)
        .invoke('attr', 'data-iscurrent')
        .should('eq', 'true');

      [
        {
          el: 1,
          touchMoveClientX: window.innerWidth / 2 - 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 2,
          touchMoveClientX: window.innerWidth / 2 - 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 3,
          touchMoveClientX: window.innerWidth / 2 - 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 3,
          touchMoveClientX: window.innerWidth / 2 - 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 2,
          touchMoveClientX: window.innerWidth / 2 + 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 1,
          touchMoveClientX: window.innerWidth / 2 + 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 0,
          touchMoveClientX: window.innerWidth / 2 + 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 0,
          touchMoveClientX: window.innerWidth / 2 + 5,
          touchStartClientX: window.innerWidth / 2,
        },
      ].forEach(({ touchStartClientX, touchMoveClientX, el }) => {
        cy.get('[data-test=ModalOnboarding]').trigger('touchstart', {
          touches: [{ clientX: touchStartClientX }],
        });
        cy.get('[data-test=ModalOnboarding]').trigger('touchmove', {
          touches: [{ clientX: touchMoveClientX }],
        });
        cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
          .eq(el)
          .invoke('attr', 'data-iscurrent')
          .should('eq', 'true');
      });
    });

    it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(0)
        .invoke('attr', 'data-iscurrent')
        .should('eq', 'true');

      [
        {
          el: 1,
          touchMoveClientX: window.innerWidth / 2 - 5,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 1,
          touchMoveClientX: window.innerWidth / 2 - 4,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 1,
          touchMoveClientX: window.innerWidth / 2 + 4,
          touchStartClientX: window.innerWidth / 2,
        },
        {
          el: 0,
          touchMoveClientX: window.innerWidth / 2 + 5,
          touchStartClientX: window.innerWidth / 2,
        },
      ].forEach(({ touchStartClientX, touchMoveClientX, el }) => {
        cy.get('[data-test=ModalOnboarding]').trigger('touchstart', {
          touches: [{ clientX: touchStartClientX }],
        });
        cy.get('[data-test=ModalOnboarding]').trigger('touchmove', {
          touches: [{ clientX: touchMoveClientX }],
        });
        cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
          .eq(el)
          .invoke('attr', 'data-iscurrent')
          .should('eq', 'true');
      });
    });
  });
});
