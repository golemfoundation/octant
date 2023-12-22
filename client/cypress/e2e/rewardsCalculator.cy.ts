import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`rewards calculator: ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
      cy.activateShowTestnetNetworksInMetamask();
      cy.changeMetamaskNetwork('sepolia');
    });

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

    it('clicking on rewards calculator icon opens rewards calcultor modal', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=ModalRewardsCalculator]').should('be.visible');
    });

    it('default values in rewards calculator are 90 days and 5000 GLM', () => {
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=RewardsCalculator__InputText--crypto]').invoke('val').should('eq', '5000');
      cy.get('[data-test=RewardsCalculator__InputText--days]').invoke('val').should('eq', '90');
    });

    it('calculator fetches rewards values in ETH and USD based on DAYS and GLM fields', () => {
      cy.intercept('POST', '/rewards/estimated_budget', {
        body: { budget: '4253424657534245' },
        delay: 500,
      }).as('postEstimatedRewards');
      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewards');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '0.0043');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '8.78');

      cy.intercept('POST', '/rewards/estimated_budget', {
        body: { budget: '425342465753424665' },
        delay: 500,
      }).as('postEstimatedRewardsGlmValueChange');
      cy.get('[data-test=RewardsCalculator__InputText--crypto]').type('500000');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewardsGlmValueChange');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '0.4253');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '868.42');

      cy.intercept('POST', '/rewards/estimated_budget', {
        body: { budget: '4253424657534246509' },
        delay: 500,
      }).as('postEstimatedRewardsDaysValueChange');
      cy.get('[data-test=RewardsCalculator__InputText--days]').clear().type('900');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'be.visible',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'be.visible',
      );
      cy.wait('@postEstimatedRewardsDaysValueChange');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat__Loader]').should(
        'not.exist',
      );
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '4.2534');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '8685.06');
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
      cy.intercept('POST', '/rewards/estimated_budget', {
        body: { budget: '850684931506849269541' },
        delay: 500,
      }).as('postEstimatedRewards');

      cy.get('[data-test=Tooltip__rewardsCalculator__body]').click();

      cy.get('[data-test=RewardsCalculator__InputText--crypto]').type('1000000000');
      cy.wait('@postEstimatedRewards');

      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--crypto]')
        .invoke('val')
        .should('eq', '850.6849');
      cy.get('[data-test=RewardsCalculator__InputText--estimatedRewards--fiat]')
        .invoke('val')
        .should('eq', '1737022.00');

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
    });
  });
});
