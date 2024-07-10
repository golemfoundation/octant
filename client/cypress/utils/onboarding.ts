import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import { mockCoinPricesServer, visitWithLoader } from './e2e';

import Chainable = Cypress.Chainable;

export const connectWallet = (
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
  cy.wait(500);
  cy.get('[data-test=MainLayout__Button--connect]').click();
  cy.wait(500);
  cy.get('[data-test=ConnectWallet__BoxRounded--browserWallet]').click();
  cy.switchToMetamaskNotification();
  return cy.acceptMetamaskAccess();
};

export const beforeSetup = (): void => {
  mockCoinPricesServer();
  // cy.setupMetamask();
  window.innerWidth = Cypress.config().viewportWidth;
  window.innerHeight = Cypress.config().viewportHeight;
};

export const checkCurrentElement = (el: number, isCurrent: boolean): Chainable<any> => {
  return cy
    .get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
    .eq(el)
    .invoke('attr', 'data-iscurrent')
    .should('eq', `${isCurrent}`);
};

export const checkProgressStepperSlimIsCurrentAndClickNext = (
  index: number,
  isCurrent = true,
): Chainable<any> => {
  checkCurrentElement(index - 1, isCurrent);
  return cy
    .get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
    .eq(index)
    .click({ force: true });
};

export const checkChangeStepsWithArrowKeys = (isTOSAccepted: boolean): void => {
  checkCurrentElement(0, true);

  [
    { el: 1, key: 'ArrowRight' },
    { el: 2, key: 'ArrowRight' },
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

export const checkChangeStepsByClickingEdgeOfTheScreenUpTo25px = (isTOSAccepted: boolean): void => {
  checkCurrentElement(0, true);

  cy.get('[data-test=ModalOnboarding]').then(element => {
    const leftEdgeX = element.offsetParent().offset()?.left as number;
    const rightEdgeX = (leftEdgeX as number) + element.innerWidth()!;

    [
      { clientX: rightEdgeX - 25, el: 1 },
      { clientX: rightEdgeX - 10, el: 2 },
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

export const checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px = (
  isTOSAccepted: boolean,
): void => {
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

export const checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px = (
  isTOSAccepted: boolean,
): void => {
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

export const checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px = (
  isTOSAccepted: boolean,
): void => {
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
