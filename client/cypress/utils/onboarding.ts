import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

import { mockCoinPricesServer, visitWithLoader } from './e2e';

import Chainable = Cypress.Chainable;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const connectWalletOnboarding = (mockedTOSResponse?: boolean): Chainable<any> => {
  // mockedTOSResponse variable is for development use only
  // In CI, e2e tests are run serially and mocking TOS response is not required
  if (mockedTOSResponse !== undefined) {
    cy.intercept(
      {
        method: 'POST',
        url: '/user/*/tos',
      },
      { body: { accepted: true }, statusCode: 200 },
    );
    cy.intercept('GET', '/user/*/tos', { body: { accepted: mockedTOSResponse } });
  }

  cy.disconnectMetamaskWalletFromAllDapps();
  visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);

  cy.wait(500);
  cy.get('[data-test=LayoutTopBar__Button]').click();
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

export const checkChangeStepsByClickingEdgeOfTheScreenUpTo25px = (
  isTOSAccepted: boolean,
  isMobileOrTablet = false,
): void => {
  checkCurrentElement(0, true);
  cy.wait(500);
  cy.get('[data-test=ModalOnboarding]').then(element => {
    [
      { distanceFromTheLeftEdge: element.width()! - 25, el: 1 },
      { distanceFromTheLeftEdge: element.width()! - 10, el: 2 },
      { distanceFromTheLeftEdge: 10, el: 1 },
      { distanceFromTheLeftEdge: 5, el: 0 },
      { distanceFromTheLeftEdge: 0, el: 0 },
    ].forEach(({ distanceFromTheLeftEdge, el }) => {
      cy.get('[data-test=ModalOnboarding]').click(distanceFromTheLeftEdge, element.height()! / 2, {
        force: isMobileOrTablet,
      });
      checkCurrentElement(el, isTOSAccepted || el === 0);

      if (!isTOSAccepted) {
        checkCurrentElement(0, true);
      }
    });
  });
};

export const checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px = (
  isTOSAccepted: boolean,
  isMobileOrTablet = false,
): void => {
  checkCurrentElement(0, true);
  cy.wait(500);
  cy.get('[data-test=ModalOnboarding]').then(element => {
    [
      { distanceFromTheLeftEdge: element.width()! - 25, el: 1 },
      { distanceFromTheLeftEdge: element.width()! - 26, el: 1 },
      { distanceFromTheLeftEdge: 26, el: 1 },
      { distanceFromTheLeftEdge: 25, el: 0 },
    ].forEach(({ distanceFromTheLeftEdge, el }) => {
      cy.get('[data-test=ModalOnboarding]').click(distanceFromTheLeftEdge, element.height()! / 2, {
        force: isMobileOrTablet,
      });
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
