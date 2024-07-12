// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  visitWithLoader,
  mockCoinPricesServer,
  connectWallet,
  ETH_USD,
  changeMainValueToFiat,
} from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_CRYPTO_MAIN_VALUE_DISPLAY,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

const splitTheValueUsingSlider = (isCryptoAsAMainValue: boolean) => {
  if (!isCryptoAsAMainValue) {
    changeMainValueToFiat(ROOT_ROUTES.allocation.absolute);
  }

  cy.get('[data-test=AllocationRewardsBox__title]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);
  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);

  cy.get('[data-test=AllocationRewardsBox__Slider]').then($sliderEl => {
    const { width: sliderElWidth } = $sliderEl[0].getBoundingClientRect();

    cy.get('[data-test=AllocationRewardsBox__Slider__thumb]').then(sliderButtonEl => {
      const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

      // track 0 is hidden under the thumb
      cy.get('[data-test=AllocationRewardsBox__Slider__track--0]').should(
        'have.css',
        'width',
        `${sliderButtonDimensions.width}px`,
      );
      cy.get('[data-test=AllocationRewardsBox__Slider__track--1]').should(
        'have.css',
        'width',
        `${sliderElWidth}px`,
      );

      const pageX0 = sliderButtonDimensions.left;
      const pageX50 =
        sliderButtonDimensions.left - sliderButtonDimensions.width / 2 + sliderElWidth / 2;
      const pageX100 =
        sliderButtonDimensions.left - sliderButtonDimensions.width / 2 + sliderElWidth;

      cy.get('[data-test=AllocationRewardsBox__Slider__thumb]')
        .trigger('mousedown', {
          pageX: pageX0,
        })
        .trigger('mousemove', {
          pageX: pageX50,
        })
        .trigger('mouseup', {
          pageX: pageX50,
        });

      cy.get('[data-test=AllocationRewardsBox__Slider__track--0]').should(
        'have.css',
        'width',
        `${(sliderButtonDimensions.width + sliderElWidth) / 2}px`,
      );
      cy.get('[data-test=AllocationRewardsBox__Slider__track--0]')
        .then($el => $el.css('background-color'))
        .should('be.colored', '#2d9b87');

      cy.get('[data-test=AllocationRewardsBox__Slider__track--1]').should(
        'have.css',
        'width',
        `${(sliderButtonDimensions.width + sliderElWidth) / 2}px`,
      );
      cy.get('[data-test=AllocationRewardsBox__Slider__track--1]')
        .then($el => $el.css('background-color'))
        .should('be.colored', '#ff9601');

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', isCryptoAsAMainValue ? '0.005 ETH' : `$${((0.01 * ETH_USD) / 2).toFixed(2)}`);
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', isCryptoAsAMainValue ? '0.005 ETH' : `$${((0.01 * ETH_USD) / 2).toFixed(2)}`);

      cy.get('[data-test=AllocationRewardsBox__Slider__thumb]')
        .trigger('mousedown', {
          pageX: pageX50,
        })
        .trigger('mousemove', {
          pageX: pageX100,
        })
        .trigger('mouseup', {
          pageX: pageX100,
        });

      cy.get('[data-test=AllocationRewardsBox__Slider__track--0]').should(
        'have.css',
        'width',
        `${sliderElWidth}px`,
      );
      cy.get('[data-test=AllocationRewardsBox__Slider__track--0]')
        .then($el => $el.css('background-color'))
        .should('be.colored', '#2d9b87');

      // track 1 is hidden under the thumb
      cy.get('[data-test=AllocationRewardsBox__Slider__track--1]').should(
        'have.css',
        'width',
        `${sliderButtonDimensions.width}px`,
      );
      cy.get('[data-test=AllocationRewardsBox__Slider__track--1]')
        .then($el => $el.css('background-color'))
        .should('be.colored', '#ff9601');

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
    });
  });
};

const changeDonateManually = (isCryptoAsAMainValue: boolean) => {
  if (!isCryptoAsAMainValue) {
    changeMainValueToFiat(ROOT_ROUTES.allocation.absolute);
  }

  cy.get('[data-test=AllocationRewardsBox__section--0]').click();
  cy.get('[data-test=ModalAllocationValuesEdit__header]').invoke('text').should('eq', 'Donate 0%');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0' : '0.00',
  );
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should('be.focused');
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .then($el => $el.css('border-color'))
    .should('be.colored', '#2d9b87');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '0');
  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('not.be.focused');

  // 0.01 ETH
  cy.get('[data-test=AllocationInputs__InputText--crypto]').type(
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .then($el => $el.css('border-color'))
    .should('be.colored', '#2d9b87');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');

  cy.get('[data-test=AllocationRewardsBox__section--0]').click();

  cy.get('[data-test=ModalAllocationValuesEdit__header]')
    .invoke('text')
    .should('eq', 'Donate 100%');

  // 0.1 ETH
  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .clear()
    .type(isCryptoAsAMainValue ? '0.1' : `${(0.1 * ETH_USD).toFixed(2)}`);
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .then($el => $el.css('border-color'))
    .should('be.colored', '#FF6157');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

  cy.get('[data-test=AllocationInputs__Button]').should('be.disabled');

  cy.get('[data-test=AllocationInputs__InputText--crypto]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '0');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0' : '0.00',
  );

  // 50 %
  cy.get('[data-test=AllocationInputs__InputText--percentage]').type('50');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.005' : `${((0.01 * ETH_USD) / 2).toFixed(2)}`,
  );

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.005 ETH' : `$${((0.01 * ETH_USD) / 2).toFixed(2)}`);
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.005 ETH' : `$${((0.01 * ETH_USD) / 2).toFixed(2)}`);

  cy.get('[data-test=AllocationRewardsBox__section--0]').click();

  cy.get('[data-test=ModalAllocationValuesEdit__header]').invoke('text').should('eq', 'Donate 50%');

  // 100 %
  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').type('100');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');

  cy.get('[data-test=AllocationRewardsBox__section--0]').click();

  cy.get('[data-test=ModalAllocationValuesEdit__header]')
    .invoke('text')
    .should('eq', 'Donate 100%');

  // 1000 %
  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').type('1000');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
};

const changePersonalManually = (isCryptoAsAMainValue: boolean) => {
  if (!isCryptoAsAMainValue) {
    changeMainValueToFiat(ROOT_ROUTES.allocation.absolute);
  }

  cy.get('[data-test=AllocationRewardsBox__section--1]').click();
  cy.get('[data-test=ModalAllocationValuesEdit__header]')
    .invoke('text')
    .should('eq', 'Personal 100%');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should('be.focused');
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .then($el => $el.css('border-color'))
    .should('be.colored', '#2d9b87');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');
  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('not.be.focused');

  // 0.01 ETH
  cy.get('[data-test=AllocationInputs__InputText--crypto]').type(
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .then($el => $el.css('border-color'))
    .should('be.colored', '#2d9b87');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);

  cy.get('[data-test=AllocationRewardsBox__section--1]').click();

  cy.get('[data-test=ModalAllocationValuesEdit__header]')
    .invoke('text')
    .should('eq', 'Personal 100%');

  // 0.1 ETH
  cy.get('[data-test=AllocationInputs__InputText--crypto]').type(
    isCryptoAsAMainValue ? '0.1' : `${(0.1 * ETH_USD).toFixed(2)}`,
  );
  cy.get('[data-test=AllocationInputs__InputText--crypto]')
    .then($el => $el.css('border-color'))
    .should('be.colored', '#FF6157');
  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

  cy.get('[data-test=AllocationInputs__Button]').should('be.disabled');

  cy.get('[data-test=AllocationInputs__InputText--crypto]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '0');

  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0' : '0.00',
  );

  // 50 %
  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').type('50');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.005' : `${((0.01 * ETH_USD) / 2).toFixed(2)}`,
  );

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.005 ETH' : `$${((0.01 * ETH_USD) / 2).toFixed(2)}`);
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.005 ETH' : `$${((0.01 * ETH_USD) / 2).toFixed(2)}`);

  cy.get('[data-test=AllocationRewardsBox__section--1]').click();

  cy.get('[data-test=ModalAllocationValuesEdit__header]')
    .invoke('text')
    .should('eq', 'Personal 50%');

  // 100 %
  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').type('100');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);

  cy.get('[data-test=AllocationRewardsBox__section--1]').click();

  cy.get('[data-test=ModalAllocationValuesEdit__header]')
    .invoke('text')
    .should('eq', 'Personal 100%');

  // 1000 %
  cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
  cy.get('[data-test=AllocationInputs__InputText--percentage]').type('1000');
  cy.get('[data-test=AllocationInputs__InputText--crypto]').should(
    'have.value',
    isCryptoAsAMainValue ? '0.01' : `${(0.01 * ETH_USD).toFixed(2)}`,
  );

  cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
  cy.get('[data-test=AllocationInputs__Button]').click();

  cy.get('[data-test=AllocationRewardsBox__section__value--0]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0 ETH' : '$0.00');
  cy.get('[data-test=AllocationRewardsBox__section__value--1]')
    .invoke('text')
    .should('eq', isCryptoAsAMainValue ? '0.01 ETH' : `$${(0.01 * ETH_USD).toFixed(2)}`);
};

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(
    `allocation rewards box (disabled): ${device}`,
    { viewportHeight, viewportWidth },
    () => {
      beforeEach(() => {
        mockCoinPricesServer();
        visitWithLoader(ROOT_ROUTES.allocation.absolute);
      });

      it('is visible', () => {
        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
      });

      it(`has each field with value 0 ETH (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
        cy.get('[data-test=AllocationRewardsBox__title]').invoke('text').should('eq', '0 ETH');
        cy.get('[data-test=AllocationRewardsBox__section__value--0]')
          .invoke('text')
          .should('eq', '0 ETH');
        cy.get('[data-test=AllocationRewardsBox__section__value--1]')
          .invoke('text')
          .should('eq', '0 ETH');
      });

      it(`has each field with value $0.00 (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
        changeMainValueToFiat(ROOT_ROUTES.allocation.absolute);

        cy.get('[data-test=AllocationRewardsBox__title]').invoke('text').should('eq', '$0.00');
        cy.get('[data-test=AllocationRewardsBox__section__value--0]')
          .invoke('text')
          .should('eq', '$0.00');
        cy.get('[data-test=AllocationRewardsBox__section__value--1]')
          .invoke('text')
          .should('eq', '$0.00');
      });

      it('shows "No rewards yet" message below rewards value', () => {
        cy.get('[data-test=AllocationRewardsBox__subtitle]')
          .invoke('text')
          .should('eq', 'No rewards yet');
      });

      it('Clicking on `Donate` label or value doesn`t open modal to editing value', () => {
        cy.get('[data-test=AllocationRewardsBox__section--0]').click();
        cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');
      });

      it('Clicking on `Personal` label or value doesn`t open modal to editing value', () => {
        cy.get('[data-test=AllocationRewardsBox__section--1]').click();
        cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');
      });

      it('slider is visible', () => {
        cy.get('[data-test=AllocationRewardsBox__Slider]').should('be.visible');
      });

      it('slider thumb exists but isn`t visible', () => {
        cy.get('[data-test=AllocationRewardsBox__Slider__thumb]').should('exist');
        cy.get('[data-test=AllocationRewardsBox__Slider__thumb]').should('not.be.visible');
      });

      it('slider track should be filled in 50%', () => {
        cy.get('[data-test=AllocationRewardsBox__Slider]').then($sliderEl => {
          const { width } = $sliderEl[0].getBoundingClientRect();

          cy.get('[data-test=AllocationRewardsBox__Slider__track--0]').should(
            'have.css',
            'width',
            `${width / 2}px`,
          );
          cy.get('[data-test=AllocationRewardsBox__Slider__track--0]')
            .then($el => $el.css('background-color'))
            .should('be.colored', '#9ea39e');

          cy.get('[data-test=AllocationRewardsBox__Slider__track--1]').should(
            'have.css',
            'width',
            `${width / 2}px`,
          );
          cy.get('[data-test=AllocationRewardsBox__Slider__track--1]')
            .then($el => $el.css('background-color'))
            .should('be.colored', '#cdd1cd');
        });
      });

      it('Clicking on `Personal` label or value doesn`t open modal to editing value', () => {
        cy.get('[data-test=AllocationRewardsBox__section--1]').click();
        cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');
      });

      it('Clicking on `Personal` label or value doesn`t open modal to editing value', () => {
        cy.get('[data-test=AllocationRewardsBox__section--1]').click();
        cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');
      });
    },
  );

  describe(`allocation rewards box (enabled): ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      /**
       * Global Metamask setup done by Synpress is not always done.
       * Since Synpress needs to have valid provider to fetch the data from contracts,
       * setupMetamask is required in each test suite.
       */
      cy.setupMetamask();
    });

    beforeEach(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.allocation.absolute);
      cy.intercept('GET', '/rewards/budget/*/epoch/*', { body: { budget: '10000000000000000' } });
      connectWallet({ isPatronModeEnabled: false, isTOSAccepted: true });
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('is visible', () => {
      cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
    });

    it('shows "Available now" message below rewards value', () => {
      cy.get('[data-test=AllocationRewardsBox__subtitle]')
        .invoke('text')
        .should('eq', 'Available now');
    });

    it(`user has 0.01 ETH rewards (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
      cy.get('[data-test=AllocationRewardsBox__title]').invoke('text').should('eq', '0.01 ETH');
    });

    it(`user has $20.42 (0.01 ETH) rewards (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
      changeMainValueToFiat(ROOT_ROUTES.allocation.absolute);

      cy.get('[data-test=AllocationRewardsBox__title]')
        .invoke('text')
        .should('eq', `$${(0.01 * ETH_USD).toFixed(2)}`);
    });

    it('slider thumb exists and is visible', () => {
      cy.get('[data-test=AllocationRewardsBox__Slider__thumb]').should('exist');
      cy.get('[data-test=AllocationRewardsBox__Slider__thumb]').should('be.visible');
    });

    it('Clicking on `Donate` label or value opens modal to editing value', () => {
      cy.get('[data-test=AllocationRewardsBox__section--0]').click();
      cy.get('[data-test=ModalAllocationValuesEdit]').should('exist').should('be.visible');
    });

    it('Clicking on `Personal` label or value opens modal to editing value', () => {
      cy.get('[data-test=AllocationRewardsBox__section--1]').click();
      cy.get('[data-test=ModalAllocationValuesEdit]').should('exist').should('be.visible');
    });

    it(`user can split the value by using slider from 0/100 to 50/50 and then from 50/50 to 100/0 (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
      splitTheValueUsingSlider(true);
    });

    it(`user can split the value by using slider from 0/100 to 50/50 and then from 50/50 to 100/0 (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
      splitTheValueUsingSlider(false);
    });

    it(`user can change 'Donate' value manually in modal (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
      changeDonateManually(true);
    });

    it(`user can change 'Donate' value manually in modal (${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
      changeDonateManually(false);
    });

    it(`user can change 'Personal' value manually in modal ${IS_CRYPTO_MAIN_VALUE_DISPLAY}: true)`, () => {
      changePersonalManually(true);
    });

    it(`user can change 'Personal' value manually in modal ${IS_CRYPTO_MAIN_VALUE_DISPLAY}: false)`, () => {
      changePersonalManually(false);
    });
  });
});
