// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { ETH_USD, GLM_USD, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import getValueFiatToDisplay from 'src/utils/getValueFiatToDisplay';
import { parseUnitsBigInt } from 'src/utils/parseUnitsBigInt';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`rewards calculator: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.earn.absolute);
    });

    it('renders calculator icon inside box', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').should('be.visible');
    });

    if (isDesktop) {
      it('tooltip is visible on calculator icon hover and has correct text', () => {
        cy.get('[data-test=Tooltip__rewardsCalculator').trigger('mouseover');
        cy.get('[data-test=Tooltip__rewardsCalculator__content')
          .should('be.visible')
          .invoke('text')
          .should('eq', 'Calculate rewards');
      });
    }

    it('clicking on rewards calculator icon opens rewards calculator modal', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=ModalRewardsCalculator]').should('be.visible');
    });

    it('GLM amount input is visible, has "5000" as a default value and a "GLM" suffix', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=EarnRewardsCalculator__InputText--glm]').should('be.visible');
      cy.get('[data-test=EarnRewardsCalculator__InputText--glm]')
        .invoke('val')
        .should('eq', '5000');
      cy.get('[data-test=EarnRewardsCalculator__InputText--glm__suffix]').should('be.visible');
      cy.get('[data-test=EarnRewardsCalculator__InputText--glm__suffix]')
        .invoke('text')
        .should('eq', 'GLM');
    });

    it('Days selector is visible, has 3 options (90, 180, 270), "90" as a default value and "DAYS" suffix', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=EarnRewardsCalculatorEpochDaysSelector]').should('be.visible');
      cy.get('[data-test*=EarnRewardsCalculatorEpochDaysSelector__label]')
        .invoke('text')
        .should('eq', 'Lock for 1 epoch');
      cy.get('[data-test*=EarnRewardsCalculatorEpochDaysSelector__option--]').then(options => {
        for (let i = 1; i <= options.length; i++) {
          cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__option--${i}]`)
            .then($el => $el.css('color'))
            .should('be.colored', i === 1 ? '#171717' : '#cdd1cd');
          cy.get(
            `[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--${i}]`,
          ).should(i === 1 ? 'exist' : 'not.exist');

          if (i === 1) {
            cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--${i}]`)
              .then($el => $el.css('background-color'))
              .should('be.colored', '#ebebeb');
          }
          cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionLabel--${i}]`)
            .invoke('text')
            .should('eq', `${i * 90}`);
        }
      });
      cy.get('[data-test*=EarnRewardsCalculatorEpochDaysSelector__suffix]')
        .invoke('text')
        .should('eq', 'Days');
    });

    it('UQ selector is visible, has 2 options (Yes, No), "Yes" as a default value', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=EarnRewardsCalculatorUqSelector]').should('be.visible');
      cy.get('[data-test*=EarnRewardsCalculatorUqSelector__option--]').then(options => {
        for (let i = 1; i <= options.length; i++) {
          cy.get(`[data-test=EarnRewardsCalculatorUqSelector__option--${i}]`)
            .then($el => $el.css('color'))
            .should('be.colored', i === 1 ? '#171717' : '#cdd1cd');
          cy.get(`[data-test=EarnRewardsCalculatorUqSelector__optionBackground--${i}]`).should(
            i === 1 ? 'exist' : 'not.exist',
          );

          if (i === 1) {
            cy.get(`[data-test=EarnRewardsCalculatorUqSelector__optionBackground--${i}]`)
              .then($el => $el.css('background-color'))
              .should('be.colored', '#ebebeb');
          }
          cy.get(`[data-test=EarnRewardsCalculatorUqSelector__optionLabel--${i}]`)
            .invoke('text')
            .should('eq', i === 1 ? 'Yes' : 'No');
        }
      });
    });

    it('Estimates box is visibile and has "Rewards" and "Match funding" fields', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=EarnRewardsCalculatorEstimates]').should('be.visible');
      cy.get('[data-test=EarnRewardsCalculatorEstimates__label]')
        .invoke('text')
        .should('eq', 'Estimates');

      cy.get('[data-test=EarnRewardsCalculatorEstimates__rewards]').should('be.visible');
      cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsLabel]')
        .invoke('text')
        .should('eq', 'Rewards ');

      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFunding]').should('be.visible');
      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingLabel]')
        .invoke('text')
        .should('eq', 'Match funding');
    });

    it('User can change days selector value', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=EarnRewardsCalculatorEpochDaysSelector__option--2]').click();
      cy.wait(500);
      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__option--2]`)
        .then($el => $el.css('color'))
        .should('be.colored', '#171717');
      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--2]`).should(
        'exist',
      );
      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--2]`)
        .then($el => $el.css('background-color'))
        .should('be.colored', '#ebebeb');

      cy.get('[data-test=EarnRewardsCalculatorEpochDaysSelector__option--3]').click();
      cy.wait(500);

      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__option--2]`)
        .then($el => $el.css('color'))
        .should('be.colored', '#cdd1cd');
      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--2]`).should(
        'not.exist',
      );

      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__option--3]`)
        .then($el => $el.css('color'))
        .should('be.colored', '#171717');
      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--3]`).should(
        'exist',
      );
      cy.get(`[data-test=EarnRewardsCalculatorEpochDaysSelector__optionBackground--3]`)
        .then($el => $el.css('background-color'))
        .should('be.colored', '#ebebeb');
    });

    it('Calculator shows "Rewards" and "Match funding" in USD based on GLM input value and days selector option', () => {
      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewards');

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();

      cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
        'be.visible',
      );
      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
        'be.visible',
      );

      cy.wait('@postEstimatedRewards');

      cy.get('@postEstimatedRewards').then(
        ({
          response: {
            body: { budget, matchedFunding },
          },
        }) => {
          const rewardsUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(budget, 'wei'),
          });

          const matchFundingUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(matchedFunding, 'wei'),
          });

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
            'not.exist',
          );
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
            'not.exist',
          );

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat')
            .invoke('text')
            .should('eq', rewardsUsd);
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat]')
            .invoke('text')
            .should('eq', matchFundingUsd);
        },
      );

      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewardsGlmValueChange');
      cy.get('[data-test=EarnRewardsCalculator__InputText--glm]').type('500000');
      cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
        'be.visible',
      );
      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewardsGlmValueChange');

      cy.get('@postEstimatedRewardsGlmValueChange').then(
        ({
          response: {
            body: { budget, matchedFunding },
          },
        }) => {
          const rewardsUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(budget, 'wei'),
          });

          const matchFundingUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(matchedFunding, 'wei'),
          });

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
            'not.exist',
          );
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
            'not.exist',
          );

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat')
            .invoke('text')
            .should('eq', rewardsUsd);
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat]')
            .invoke('text')
            .should('eq', matchFundingUsd);
        },
      );

      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewardsDaysValueChange');
      cy.get('[data-test=EarnRewardsCalculatorEpochDaysSelector__option--2]').click();
      cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
        'be.visible',
      );
      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewardsDaysValueChange');

      cy.get('@postEstimatedRewardsDaysValueChange').then(
        ({
          response: {
            body: { budget, matchedFunding },
          },
        }) => {
          const rewardsUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(budget, 'wei'),
          });

          const matchFundingUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(matchedFunding, 'wei'),
          });

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
            'not.exist',
          );
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
            'not.exist',
          );

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat')
            .invoke('text')
            .should('eq', rewardsUsd);
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat]')
            .invoke('text')
            .should('eq', matchFundingUsd);
        },
      );
    });

    it('If GLM input is empty estimates section fields are empty too', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=EarnRewardsCalculator__InputText--glm]').clear();
      cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat--skeleton]').should(
        'not.exist',
      );
      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat--skeleton]').should(
        'not.exist',
      );
      // Debouce prevents value from being immediately loaded. Let's give it a chance to load.
      cy.wait(5000);
      cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat]')
        .invoke('text')
        .should('eq', '');
    });

    it('Max GLM amount is 1000000000', () => {
      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewards');

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();

      cy.get('[data-test=EarnRewardsCalculator__InputText--glm]').type('1000000000');
      cy.wait('@postEstimatedRewards');

      cy.get('@postEstimatedRewards').then(
        ({
          response: {
            body: { budget, matchedFunding },
          },
        }) => {
          const rewardsUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(budget, 'wei'),
          });

          const matchFundingUsd = getValueFiatToDisplay({
            cryptoCurrency: 'ethereum',
            cryptoValues: { ethereum: { usd: ETH_USD }, golem: { usd: GLM_USD } },
            displayCurrency: 'usd',
            valueCrypto: parseUnitsBigInt(matchedFunding, 'wei'),
          });

          cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat')
            .invoke('text')
            .should('eq', rewardsUsd);
          cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat]')
            .invoke('text')
            .should('eq', matchFundingUsd);

          cy.get('[data-test=EarnRewardsCalculator__InputText--glm]')
            .clear()
            .type('1000000001')
            .should('have.css', 'border-color', 'rgb(255, 97, 87)');
          cy.get('[data-test=EarnRewardsCalculator__InputText--glm__error]')
            .should('be.visible')
            .invoke('text')
            .should('eq', 'That isn’t a valid amount');
        },
      );
    });

    it('Closing the modal successfully cancels the request /estimated_budget', () => {
      cy.window().then(win => {
        cy.spy(win.console, 'error').as('consoleErrSpy');
      });

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();

      cy.get('[data-test=ModalRewardsCalculator__Button]').click();
      cy.get('[data-test=ModalRewardsCalculator').should('not.be.visible');

      cy.on('uncaught:exception', error => {
        expect(error.code).to.equal('ERR_CANCELED');
      });
    });

    it('Estimates section shows correct fiat values', () => {
      cy.intercept('POST', '/rewards/estimated_budget', {
        body: { budget: '18829579190901', matchedFunding: '18829579190901' },
        delay: 500,
      }).as('postEstimatedRewards');

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.wait('@postEstimatedRewards');

      cy.get('@postEstimatedRewards').then(() => {
        cy.get('[data-test=EarnRewardsCalculatorEstimates__rewardsFiat')
          .invoke('text')
          .should('eq', '$0.04');
        cy.get('[data-test=EarnRewardsCalculatorEstimates__matchFundingFiat]')
          .invoke('text')
          .should('eq', '$0.04');
      });
    });
  });
});
