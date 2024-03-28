import { visitWithLoader, navigateWithCheck, mockCoinPricesServer } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { stepsDecisionWindowClosed } from 'src/hooks/helpers/useOnboardingSteps/steps';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import Chainable = Cypress.Chainable;

const connectWallet = (
  isTOSAccepted: boolean,
  shouldVisit = true,
  shouldReload = false,
): Chainable<any> => {
  cy.intercept('GET', '/user/*/tos', { body: { accepted: isTOSAccepted } });
  cy.disconnectMetamaskWalletFromAllDapps();
  if (shouldVisit) {
    visitWithLoader(ROOT.absolute, ROOT_ROUTES.projects.absolute);
  }
  if (shouldReload) {
    cy.reload();
  }
  cy.get('[data-test=MainLayout__Button--connect]').click();
  cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
  cy.switchToMetamaskNotification();
  return cy.acceptMetamaskAccess();
};

const beforeSetup = () => {
  mockCoinPricesServer();
  cy.clearLocalStorage();
  cy.setupMetamask();
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
    // { el: 3, key: 'ArrowRight' },
    // { el: 3, key: 'ArrowRight' },
    // { el: 2, key: 'ArrowLeft' },
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

const checkChangeStepsByClickingEdgeOfTheScreenUpTo25px = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

  cy.get('[data-test=ModalOnboarding]').then(element => {
    const leftEdgeX = element.offsetParent().offset()?.left as number;
    const rightEdgeX = (leftEdgeX as number) + element.innerWidth()!;

    [
      { clientX: rightEdgeX - 25, el: 1 },
      { clientX: rightEdgeX - 10, el: 2 },
      // { clientX: rightEdgeX - 5, el: 3 },
      // rightEdgeX === browser right frame
      // { clientX: rightEdgeX - 1, el: 3 },
      // { clientX: leftEdgeX + 25, el: 2 },
      { clientX: leftEdgeX + 10, el: 1 },
      { clientX: leftEdgeX + 5, el: 0 },
      { clientX: leftEdgeX, el: 0 },
    ].forEach(({ clientX, el }) => {
      cy.get('[data-test=ModalOnboarding]').click(clientX, element.height()! / 2);
      checkCurrentElement(el, isTOSAccepted || el === 0);

      if (!isTOSAccepted) {
        checkCurrentElement(0, true);
      }
    });
  });
};

const checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px = (isTOSAccepted: boolean) => {
  checkCurrentElement(0, true);

  cy.get('[data-test=ModalOnboarding]').then(element => {
    const leftEdgeX = element.offsetParent().offset()?.left as number;
    const rightEdgeX = (leftEdgeX as number) + element.innerWidth()!;

    [
      { clientX: rightEdgeX - 25, el: 1 },
      { clientX: rightEdgeX - 26, el: 1 },
      { clientX: leftEdgeX + 26, el: 1 },
      { clientX: leftEdgeX + 25, el: 0 },
    ].forEach(({ clientX, el }) => {
      cy.get('[data-test=ModalOnboarding]').click(clientX, element.height()! / 2);
      checkCurrentElement(el, isTOSAccepted || el === 0);

      if (!isTOSAccepted) {
        checkCurrentElement(0, true);
      }
    });
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
      el: 2,
      touchMoveClientX: window.innerWidth / 2 - 5,
      touchStartClientX: window.innerWidth / 2,
    },
    // {
    //   el: 3,
    //   touchMoveClientX: window.innerWidth / 2 - 5,
    //   touchStartClientX: window.innerWidth / 2,
    // },
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
      for (let i = 1; i < stepsDecisionWindowClosed.length - 1; i++) {
        checkProgressStepperSlimIsCurrentAndClickNext(i);
      }

      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(stepsDecisionWindowClosed.length - 1)
        .click();
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
      cy.get('[data-test=ProjectsView__ProjectsList]').should('be.visible');
    });

    it('user is able to close the modal by clicking button in the top-right', () => {
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
      cy.get('[data-test=ProjectsView__ProjectsList]').should('be.visible');
    });

    it('renders every time page is refreshed when "Always show Allocate onboarding" option is checked', () => {
      cy.get('[data-test=ModalOnboarding__Button]').click();
      navigateWithCheck(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').check().should('be.checked');
      cy.reload();
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
    });

    it('renders only once when "Always show Allocate onboarding" option is not checked', () => {
      cy.get('[data-test=ModalOnboarding__Button]').click();
      navigateWithCheck(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('not.be.checked');
      cy.reload();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
    });

    it('user can change steps with arrow keys (left, right)', () => {
      checkChangeStepsWithArrowKeys(true);
    });

    it('user can change steps by clicking the edge of the screen (up to 25px from each edge)', () => {
      checkChangeStepsByClickingEdgeOfTheScreenUpTo25px(true);
    });

    it('user cannot change steps by clicking the edge of the screen (more than 25px from each edge)', () => {
      checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px(true);
    });

    it('user can change steps by swiping on screen (difference more than or equal 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px(true);
    });

    it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px(true);
    });

    it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
      checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px(true);
    });

    it('user is able to close the onboarding, and after disconnecting & connecting, onboarding does not show up again', () => {
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
      connectWallet(true, false, true);
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
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

    it('onboarding TOS step should be first and active', () => {
      checkCurrentElement(0, true);
      cy.get('[data-test=ModalOnboardingTOS]').should('be.visible');
    });

    it('user is not able to click through entire onboarding flow', () => {
      for (let i = 1; i < stepsDecisionWindowClosed.length; i++) {
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

    it('user can change steps by clicking the edge of the screen (up to 25px from each edge)', () => {
      checkChangeStepsByClickingEdgeOfTheScreenUpTo25px(false);
    });

    it('user cannot change steps by clicking the edge of the screen (more than 25px from each edge)', () => {
      checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px(false);
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

    it('TOS acceptance allows the user to close the modal by clicking button in the top-right', () => {
      checkCurrentElement(0, true);
      cy.get('[data-test=TOS_InputCheckbox]').check();
      cy.switchToMetamaskNotification();
      cy.confirmMetamaskSignatureRequest();
      checkCurrentElement(1, true);
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
    });
  });
});
