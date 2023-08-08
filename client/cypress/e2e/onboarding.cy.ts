import { visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import steps from 'src/hooks/helpers/useOnboardingSteps/steps';
import { ROOT } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

const connectWallet = (isTOSAccepted: boolean): Chainable<any> => {
  cy.intercept('GET', '/user/*/tos', { body: { accepted: isTOSAccepted } });
  cy.disconnectMetamaskWalletFromAllDapps();
  visitWithLoader(ROOT.absolute);
  cy.get('[data-test=MainLayout__Button--connect]').click();
  cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
  cy.switchToMetamaskNotification();
  return cy.acceptMetamaskAccess();
};

const beforeSetup = () => {
  cy.clearLocalStorage();
  cy.setupMetamask();
  cy.activateShowTestnetNetworksInMetamask();
  cy.changeMetamaskNetwork('sepolia');
  window.innerWidth = Cypress.config().viewportWidth;
  window.innerHeight = Cypress.config().viewportHeight;
};

const checkCurrentElement = (el: number, isCurrent: boolean): Chainable<any> => {
  return cy
    .get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
    .eq(el)
    .invoke('attr', 'data-iscurrent')
    .should('eq', `${isCurrent}`);
};

const checkProgressStepperSlimIsCurrentAndClickNext = (index, isCurrent = true): Chainable<any> => {
  checkCurrentElement(index - 1, isCurrent);
  return cy
    .get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
    .eq(index)
    .click({ force: true });
};

const checkChangeStepsWithArrowKeys = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

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
    checkCurrentElement(el, isTOSAccepted || el === 0);

    if (!isTOSAccepted) {
      checkCurrentElement(0, true);
    }
  });
};

const checkChangeStepsByTouchingEdgeOfTheScreenUpTo15px = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

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
    checkCurrentElement(el, isTOSAccepted || el === 0);

    if (!isTOSAccepted) {
      checkCurrentElement(0, true);
    }
  });
};

const checkChangeStepsByTouchingEdgeOfTheScreenMoreThan15px = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

  [
    { clientX: window.innerWidth - 15, el: 1 },
    { clientX: window.innerWidth - 16, el: 1 },
    { clientX: 16, el: 1 },
    { clientX: 15, el: 0 },
  ].forEach(({ clientX, el }) => {
    cy.get('[data-test=ModalOnboarding]').trigger('touchstart', { touches: [{ clientX }] });
    checkCurrentElement(el, isTOSAccepted || el === 0);

    if (!isTOSAccepted) {
      checkCurrentElement(0, true);
    }
  });
};

const checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

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
    checkCurrentElement(el, isTOSAccepted || el === 0);

    if (!isTOSAccepted) {
      checkCurrentElement(0, true);
    }
  });
};

const checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

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
    checkCurrentElement(el, isTOSAccepted || el === 0);

    if (!isTOSAccepted) {
      checkCurrentElement(0, true);
    }
  });
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`onboarding (TOS accepted): ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      beforeSetup();
    });

    beforeEach(() => {
      connectWallet(true);
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
      checkChangeStepsWithArrowKeys(true);
    });

    it('user can change steps by touching the edge of the screen (up to 15px from each edge)', () => {
      checkChangeStepsByTouchingEdgeOfTheScreenUpTo15px(true);
    });

    it('user cannot change steps by touching the edge of the screen (more than 15px from each edge)', () => {
      checkChangeStepsByTouchingEdgeOfTheScreenMoreThan15px(true);
    });

    it('user can change steps by swiping on screen (difference more than or equal 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px(true);
    });

    it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px(true);
    });
  });
});

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`onboarding (TOS not accepted): ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      beforeSetup();
    });

    beforeEach(() => {
      cy.intercept(
        {
          method: 'POST',
          url: '/user/*/tos',
        },
        { body: { accepted: true }, statusCode: 200 },
      );
      connectWallet(false);
    });

    it('onboarding should have one more step (TOS)', () => {
      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]').should(
        'have.length',
        steps.length + 1,
      );
    });

    it('user is not able to click through entire onboarding flow', () => {
      for (let i = 1; i < steps.length; i++) {
        checkProgressStepperSlimIsCurrentAndClickNext(i, i === 1);
      }
    });

    it('user is not able to close the modal by clicking button in the top-right', () => {
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
      cy.get('[data-test=ModalOnboarding__Button]').click({ force: true });
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
    });

    it('renders every time page is refreshed', () => {
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
      cy.reload();
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
    });

    it('user cannot change steps with arrow keys (left, right)', () => {
      checkChangeStepsWithArrowKeys(false);
    });

    it('user cannot change steps by touching the edge of the screen (up to 15px from each edge)', () => {
      checkChangeStepsByTouchingEdgeOfTheScreenUpTo15px(false);
    });

    it('user cannot change steps by touching the edge of the screen (more than 15px from each edge)', () => {
      checkChangeStepsByTouchingEdgeOfTheScreenMoreThan15px(false);
    });

    it('user cannot change steps by swiping on screen (difference more than or equal 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px(false);
    });

    it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px(false);
    });

    it('TOS acceptance changes onboarding step to next step', () => {
      checkCurrentElement(0, true);
      cy.get('[data-test=TOS_InputCheckbox]').check();
      cy.switchToMetamaskNotification();
      cy.confirmMetamaskSignatureRequest();
      checkCurrentElement(1, true);
    });
  });
});
