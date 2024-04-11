import { ETH_USD, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';
import getFormattedEthValue from 'src/utils/getFormattedEthValue';
import { parseUnitsBigInt } from 'src/utils/parseUnitsBigInt';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`rewards calculator: ${device}`, { viewportHeight, viewportWidth }, () => {
    beforeEach(() => {
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
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

    it('default values in rewards calculator are 90 days and 5000 GLM', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=RewardsCalculator__InputText--crypto]').invoke('val').should('eq', '5000');
      cy.get('[data-test=RewardsCalculator__InputText--days]').invoke('val').should('eq', '90');
    });

    it('calculator fetches rewards values in ETH and USD based on DAYS and GLM fields', () => {
      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewards');
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewards');

      cy.get('@postEstimatedRewards').then(
        ({
          response: {
            body: { budget },
          },
        }) => {
          const rewardsEth = getFormattedEthValue(parseUnitsBigInt(budget, 'wei')).value;
          const rewardsUsd = (parseFloat(rewardsEth) * ETH_USD).toFixed(2);

          cy.get(
            '[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]',
          ).should('not.exist');
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
            'not.exist',
          );
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
            .invoke('val')
            .should('eq', rewardsEth);
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
            .invoke('val')
            .should('eq', rewardsUsd);
        },
      );

      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewardsGlmValueChange');
      cy.get('[data-test=RewardsCalculator__InputText--crypto]').type('500000');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewardsGlmValueChange');

      cy.get('@postEstimatedRewardsGlmValueChange').then(
        ({
          response: {
            body: { budget },
          },
        }) => {
          const rewardsEth = getFormattedEthValue(parseUnitsBigInt(budget, 'wei')).value;
          const rewardsUsd = (parseFloat(rewardsEth) * ETH_USD).toFixed(2);

          cy.get(
            '[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]',
          ).should('not.exist');
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
            'not.exist',
          );
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
            .invoke('val')
            .should('eq', rewardsEth);
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
            .invoke('val')
            .should('eq', rewardsUsd);
        },
      );

      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewardsDaysValueChange');
      cy.get('[data-test=RewardsCalculator__InputText--days]').clear().type('900');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewardsDaysValueChange');

      cy.get('@postEstimatedRewardsDaysValueChange').then(
        ({
          response: {
            body: { budget },
          },
        }) => {
          const rewardsEth = getFormattedEthValue(parseUnitsBigInt(budget, 'wei')).value;
          const rewardsUsd = (parseFloat(rewardsEth) * ETH_USD).toFixed(2);

          cy.get(
            '[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]',
          ).should('not.exist');
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
            'not.exist',
          );
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
            .invoke('val')
            .should('eq', rewardsEth);
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
            .invoke('val')
            .should('eq', rewardsUsd);
        },
      );
    });

    it('If DAYS or GLM input is empty rewards inputs are empty too', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=RewardsCalculator__InputText--crypto]').clear();
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '');

      cy.get('[data-test=RewardsCalculator__InputText--days]').clear();
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '');

      cy.get('[data-test=RewardsCalculator__InputText--crypto]').type('5000');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '');
    });

    it('Max GLM amount is 1000000000', () => {
      cy.intercept('POST', '/rewards/estimated_budget').as('postEstimatedRewards');

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();

      cy.get('[data-test=RewardsCalculator__InputText--crypto]').type('1000000000');
      cy.wait('@postEstimatedRewards');

      cy.get('@postEstimatedRewards').then(
        ({
          response: {
            body: { budget },
          },
        }) => {
          const rewardsEth = getFormattedEthValue(parseUnitsBigInt(budget, 'wei')).value;
          const rewardsUsd = (parseFloat(rewardsEth) * ETH_USD).toFixed(2);

          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
            .invoke('val')
            .should('eq', rewardsEth);
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
            .invoke('val')
            .should('eq', rewardsUsd);

          cy.get('[data-test=RewardsCalculator__InputText--crypto]')
            .clear()
            .type('1000000001')
            .should('have.css', 'border-color', 'rgb(255, 97, 87)');
          cy.get('[data-test=RewardsCalculator__InputText--crypto__error]')
            .should('be.visible')
            .invoke('text')
            .should('eq', 'That isn’t a valid amount');
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
            .invoke('val')
            .should('eq', '');
          cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
            .invoke('val')
            .should('eq', '');
        },
      );
    });

    it('Closing the modal successfully cancels the request /estimated_budget', () => {
      cy.window().then(win => {
        cy.spy(win.console, 'error').as('consoleErrSpy');
      });

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();

      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );

      cy.get('[data-test=ModalRewardsCalculator__Button]').click();
      cy.get('[data-test=ModalRewardsCalculator').should('not.be.visible');

      cy.on('uncaught:exception', error => {
        expect(error.code).to.equal('ERR_CANCELED');
      });
    });
  });
});
