// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { getViewports } from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT, ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

const { isMobile } = getViewports();

describe(`[AW IS CLOSED] Home rewards estimator:`, () => {
  before(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
    mockCoinPricesServer();
    cy.intercept('POST', '/rewards/estimated_budget', req => {
      const budgetBase = 1522070616415; // 1 GLM | 1 epoch
      const matchedFundingBase = 26329686088561; // 1 GLM | 1 epoch
      const { glmAmount: glmAmountWei, numberOfEpochs } = req.body;
      const glm = glmAmountWei / 1000000000000000000;

      if (glm < 100) {
        req.reply({
          budget: '0',
          matchedFunding: '0',
        });
        return;
      }

      req.reply({
        budget: `${budgetBase * glm * numberOfEpochs}`,
        matchedFunding: `${matchedFundingBase * glm * numberOfEpochs}`,
      });
    });

    localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
    visitWithLoader(ROOT.absolute, ROOT_ROUTES.home.absolute);
  });

  it('Rewards estimator by default shows estimation for 5000 GLM and 90 days with UQ15+', () => {
    cy.get('[data-test=HomeGridRewardsEstimatorUqSelector__InputToggle]').should('be.checked');
    cy.get('[data-test=HomeGridRewardsEstimator__InputText--glm]')
      .invoke('val')
      .should('eq', '5000');
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__label]')
      .invoke('text')
      .should('eq', 'Lock for 1 epoch');
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__optionLabel--1]')
      .then($el => $el.css('color'))
      .should('be.colored', '#171717');
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__optionBackground--1]')
      .then($el => $el.css('backgroundColor'))
      .should('be.colored', '#ebebeb');

    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0.0076 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '0.1316 ETH');
  });

  it('Rewards estimator shows 0 ETH rewards and match funding for GLM amount under 100', () => {
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimator__InputText--glm]').clear().type('100');

    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0.0002 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '0.0026 ETH');

    cy.get('[data-test=HomeGridRewardsEstimator__InputText--glm]').clear().type('99');

    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '0 ETH');

    if (isMobile) {
      cy.get('[data-test=HomeGridTransactions]').scrollIntoView({
        offset: { left: 0, top: 100 },
      });
    }
    cy.get('[data-test=HomeGridRewardsEstimatorUqSelector__InputToggle]').uncheck({
      scrollBehavior: isMobile ? false : 'top',
    });
    cy.get('[data-test=HomeGridRewardsEstimatorUqSelector__InputToggle]').should('not.be.checked');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '0 ETH');
  });

  it('User can change amount of GLM, DAYS and value of UQ15+ toggle', () => {
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimator__InputText--glm]').clear().type('100000');

    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0.1522 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '2.633 ETH');

    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__option--2]').click();

    cy.wait(500);
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__optionLabel--1]')
      .then($el => $el.css('color'))
      .should('be.colored', '#cdd1cd');
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__optionBackground--1]').should(
      'not.exist',
    );

    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__label]')
      .invoke('text')
      .should('eq', 'Lock for 2 epochs');
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__optionLabel--2]')
      .then($el => $el.css('color'))
      .should('be.colored', '#171717');
    cy.get('[data-test=HomeGridRewardsEstimatorEpochDaysSelector__optionBackground--2]')
      .then($el => $el.css('backgroundColor'))
      .should('be.colored', '#ebebeb');

    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding--loading]').should(
      'not.exist',
    );
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]').should('be.visible');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0.3044 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '5.2659 ETH');

    if (isMobile) {
      cy.get('[data-test=HomeGridTransactions]').scrollIntoView({
        offset: { left: 0, top: 100 },
      });
    }
    cy.get('[data-test=HomeGridRewardsEstimatorUqSelector__InputToggle]').uncheck({
      scrollBehavior: isMobile ? false : 'top',
    });

    cy.get('[data-test=HomeGridRewardsEstimatorUqSelector__InputToggle]').should('not.be.checked');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__estimatedRewards]')
      .invoke('text')
      .should('eq', '0.3044 ETH');
    cy.get('[data-test=HomeGridRewardsEstimatorEstimates__matchFunding]')
      .invoke('text')
      .should('eq', '0.5266 ETH');
  });
});
