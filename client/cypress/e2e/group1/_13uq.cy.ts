// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(`[AW IS CLOSED] UQ: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      cy.clearLocalStorage();
    });

    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.home.absolute);
    });

    it(
      'Each element of UQ tile is visible and has correct value',
      { scrollBehavior: false },
      () => {
        cy.get('[data-test=HomeGridUQScore]').scrollIntoView({ offset: { left: 0, top: -100 } });
        cy.get('[data-test=HomeGridUQScore__Button--whatIsThis]').should('be.visible');
        cy.get('[data-test=HomeGridUQScore__Button--whatIsThis]').click();
        cy.wait(500);
        cy.get('[data-test=ModalCalculatingYourUniqueness]').should('be.visible');
        cy.get('[data-test=ModalCalculatingYourUniqueness__ProgressStepperSlim__element]').should(
          'have.length',
          3,
        );
        cy.get('[data-test=ModalCalculatingYourUniqueness__Button]').click();
        cy.wait(500);
        cy.get('[data-test=ModalCalculatingYourUniqueness]').should('not.exist');
        cy.get('[data-test=HomeGridUQScoreAddresses]').should('be.visible');
        cy.get('[data-test=HomeGridUQScore__Button--scoreTooLow]').should('be.visible');
        cy.get('[data-test=HomeGridUQScore__Button--scoreTooLow]')
          .invoke('attr', 'href')
          .should('eq', 'https://app.passport.xyz/#/octant/');
        cy.get('[data-test=HomeGridUQScore__Button--recalculate]').should('be.visible');
        cy.get('[data-test=HomeGridUQScore__Button--delegate]').should('be.visible');
      },
    );
  });
});
