// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { visitWithLoader, mockCoinPricesServer, connectWallet } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import { IS_ONBOARDING_ALWAYS_VISIBLE, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight }) => {
  describe(
    `allocation rewards box (disabled): ${device}`,
    { viewportHeight, viewportWidth },
    () => {
      beforeEach(() => {
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        visitWithLoader(ROOT_ROUTES.allocation.absolute);
      });

      it('is visible', () => {
        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
      });

      it('has each field with value 0 ETH', () => {
        cy.get('[data-test=AllocationRewardsBox__title]').invoke('text').should('eq', '0 ETH');
        cy.get('[data-test=AllocationRewardsBox__section__value--0]')
          .invoke('text')
          .should('eq', '0 ETH');
        cy.get('[data-test=AllocationRewardsBox__section__value--1]')
          .invoke('text')
          .should('eq', '0 ETH');
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
      mockCoinPricesServer();
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      visitWithLoader(ROOT_ROUTES.allocation.absolute);
      cy.intercept('GET', '/rewards/budget/*/epoch/*', { body: { budget: '10000000000' } });
      connectWallet(true, false);
    });

    it('is visible', () => {
      cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
    });

    it('shows "Available now" message below rewards value', () => {
      cy.get('[data-test=AllocationRewardsBox__subtitle]')
        .invoke('text')
        .should('eq', 'Available now');
    });

    it('user has 10 GWEI rewards', () => {
      cy.get('[data-test=AllocationRewardsBox__title]').invoke('text').should('eq', '10 GWEI');
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

    it('user can split the value by using slider from 0/100 to 50/50 and then from 50/50 to 100/0', () => {
      cy.get('[data-test=AllocationRewardsBox__title]').invoke('text').should('eq', '10 GWEI');
      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '0 ETH');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '10 GWEI');

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
            .should('eq', '5 GWEI');
          cy.get('[data-test=AllocationRewardsBox__section__value--1]')
            .invoke('text')
            .should('eq', '5 GWEI');

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
            .should('eq', '10 GWEI');
          cy.get('[data-test=AllocationRewardsBox__section__value--1]')
            .invoke('text')
            .should('eq', '0 ETH');
        });
      });
    });

    it('user can change `Donate` value manually in modal', () => {
      cy.get('[data-test=AllocationRewardsBox__section--0]').click();
      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Donate 0%');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('be.focused');
      cy.get('[data-test=AllocationInputs__InputText--crypto]')
        .then($el => $el.css('border-color'))
        .should('be.colored', '#2d9b87');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '0');
      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('not.be.focused');

      // 10 GWEI
      cy.get('[data-test=AllocationInputs__InputText--crypto]').type('0.00000001');
      cy.get('[data-test=AllocationInputs__InputText--crypto]')
        .then($el => $el.css('border-color'))
        .should('be.colored', '#2d9b87');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '10 GWEI');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '0 ETH');

      cy.get('[data-test=AllocationRewardsBox__section--0]').click();

      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Donate 100%');

      // 100 GWEI
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--crypto]').type('0.0000001');
      cy.get('[data-test=AllocationInputs__InputText--crypto]')
        .then($el => $el.css('border-color'))
        .should('be.colored', '#FF6157');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

      cy.get('[data-test=AllocationInputs__Button]').should('be.disabled');

      cy.get('[data-test=AllocationInputs__InputText--crypto]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '0');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0');

      // 50 %
      cy.get('[data-test=AllocationInputs__InputText--percentage]').type('50');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.000000005');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '5 GWEI');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '5 GWEI');

      cy.get('[data-test=AllocationRewardsBox__section--0]').click();

      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Donate 50%');

      // 100 %
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').type('100');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.00000001');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '10 GWEI');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '0 ETH');

      cy.get('[data-test=AllocationRewardsBox__section--0]').click();

      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Donate 100%');

      // 1000 %
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').type('1000');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.00000001');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '10 GWEI');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '0 ETH');
    });

    it('user can change `Personal` value manually in modal', () => {
      cy.get('[data-test=AllocationRewardsBox__section--1]').click();
      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Personal 100%');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.00000001');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('be.focused');
      cy.get('[data-test=AllocationInputs__InputText--crypto]')
        .then($el => $el.css('border-color'))
        .should('be.colored', '#2d9b87');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');
      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('not.be.focused');

      // 10 GWEI
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--crypto]').type('0.00000001');
      cy.get('[data-test=AllocationInputs__InputText--crypto]')
        .then($el => $el.css('border-color'))
        .should('be.colored', '#2d9b87');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '0 ETH');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '10 GWEI');

      cy.get('[data-test=AllocationRewardsBox__section--1]').click();

      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Personal 100%');

      // 100 GWEI
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--crypto]').type('0.0000001');
      cy.get('[data-test=AllocationInputs__InputText--crypto]')
        .then($el => $el.css('border-color'))
        .should('be.colored', '#FF6157');
      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '100');

      cy.get('[data-test=AllocationInputs__Button]').should('be.disabled');

      cy.get('[data-test=AllocationInputs__InputText--crypto]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').should('have.value', '0');

      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0');

      // 50 %
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').type('50');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.000000005');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '5 GWEI');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '5 GWEI');

      cy.get('[data-test=AllocationRewardsBox__section--1]').click();

      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Personal 50%');

      // 100 %
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').type('100');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.00000001');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '0 ETH');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '10 GWEI');

      cy.get('[data-test=AllocationRewardsBox__section--1]').click();

      cy.get('[data-test=ModalAllocationValuesEdit__header]')
        .invoke('text')
        .should('eq', 'Personal 100%');

      // 1000 %
      cy.get('[data-test=AllocationInputs__InputText--percentage]').clear();
      cy.get('[data-test=AllocationInputs__InputText--percentage]').type('1000');
      cy.get('[data-test=AllocationInputs__InputText--crypto]').should('have.value', '0.00000001');

      cy.get('[data-test=AllocationInputs__Button]').should('not.be.disabled');
      cy.get('[data-test=AllocationInputs__Button]').click();

      cy.get('[data-test=AllocationRewardsBox__section__value--0]')
        .invoke('text')
        .should('eq', '0 ETH');
      cy.get('[data-test=AllocationRewardsBox__section__value--1]')
        .invoke('text')
        .should('eq', '10 GWEI');
    });
  });
});
