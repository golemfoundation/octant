import {
  connectWallet,
  mockCoinPricesServer,
  navigateWithCheck,
  visitWithLoader,
} from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`patron mode (disabled): ${device}`, { viewportHeight, viewportWidth }, () => {
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
      visitWithLoader(ROOT_ROUTES.settings.absolute);
      connectWallet({ isPatronModeEnabled: false, isTOSAccepted: true });
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('patron badge should not exist ', () => {
      cy.get('[data-test=ProfileInfo__badge]').should('not.exist');
    });

    it('Patron mode toggle is not checked', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').should('not.be.checked');
    });

    if (isDesktop) {
      it('Patron mode tooltip is visible on hover and has correct text', () => {
        cy.get('[data-test=SettingsPatronModeBox__Tooltip]').trigger('mouseover');
        cy.get('[data-test=SettingsPatronModeBox__Tooltip__content]').should('be.visible');
        cy.get('[data-test=SettingsPatronModeBox__Tooltip__content]')
          .invoke('text')
          .should(
            'eq',
            'Patron mode is for token holders who want to support Octant. It disables allocation to yourself or projects. All rewards go directly to the matching fund with no action required by the patron.',
          );
      });
    }

    it('Checking patron mode opens patron mode modal', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=ModalPatronMode]').should('be.visible');
    });

    it('Patron mode modal last paragraph has correct text', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=SettingsPatronMode__fourthParagraph]')
        .invoke('text')
        .should('eq', 'Slide the switch below all the way to  the right to enable patron mode.');
    });

    it('Slider is visible', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=PatronModeSlider]').should('be.visible');
    });

    it('Slider has correct label', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=PatronModeSlider__label]')
        .invoke('text')
        .should('eq', 'Slide right to confirm');
    });

    it('Slider button is visible ', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=PatronModeSlider__button]').should('be.visible');
    });

    it('Slider button has right arrow inside', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=PatronModeSlider__button__arrow]')
        .should('be.visible')
        .should('have.css', 'transform', 'none');
    });

    it('Slider button is on the left side', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();
      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderLeftDistance = sliderEl[0].getBoundingClientRect().left;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonLeftDistance = sliderButtonEl[0].getBoundingClientRect().left;

          expect(sliderButtonLeftDistance).to.be.eq(sliderLeftDistance + sliderLeftPadding);
        });
      });
    });

    it('Slider button returns to the starting point if user drops it below or equal 50% of slider width', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();

      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderDimensions = sliderEl[0].getBoundingClientRect();
        const sliderWidth = sliderDimensions.width;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

          const sliderButtonWidth = sliderButtonDimensions.width;

          const sliderTrackWidth =
            sliderWidth - sliderLeftPadding - sliderRightPadding - sliderButtonWidth;

          const pointerDownPageX = sliderButtonDimensions.x;
          const pointerMovePageX = sliderButtonDimensions.x + sliderTrackWidth / 2;

          cy.get('[data-test=PatronModeSlider__button]')
            .trigger('pointerdown', {
              pageX: pointerDownPageX,
            })
            .trigger('pointermove', {
              pageX: pointerMovePageX,
            })
            .wait(1000)
            .then(sliderButtonElAfterPointerMove => {
              const sliderButtonDimensionsAfterPointerMove =
                sliderButtonElAfterPointerMove[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerMove.x).eq(pointerMovePageX);
            })
            .trigger('pointerup')
            .wait(1000)
            .then(sliderButtonElAfterPointerUp => {
              const sliderButtonDimensionsAfterPointerUp =
                sliderButtonElAfterPointerUp[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerUp.x).eq(pointerDownPageX);
            });
        });
      });
    });

    it('Slider elements change color while moving slider button', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();

      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderDimensions = sliderEl[0].getBoundingClientRect();
        const sliderWidth = sliderDimensions.width;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

          const sliderButtonWidth = sliderButtonDimensions.width;

          const sliderTrackWidth =
            sliderWidth - sliderLeftPadding - sliderRightPadding - sliderButtonWidth;

          const slider0PercentagePageX = sliderButtonDimensions.x;
          const slider25PercentagePageX = sliderButtonDimensions.x + sliderTrackWidth / 4;
          const slider50PercentagePageX = sliderButtonDimensions.x + sliderTrackWidth / 2;
          const slider75PercentagePageX = sliderButtonDimensions.x + 3 * (sliderTrackWidth / 4);
          const slider100PercentagePageX = sliderButtonDimensions.x + sliderTrackWidth;

          // 0%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointerdown', {
            pageX: slider0PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgb(243, 243, 243)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(255, 255, 255)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(23, 23, 23)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '1');

          // 25%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider25PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(212, 224, 221, 0.95)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(222, 234, 231)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(129, 129, 129)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0.75');

          // 50%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider50PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(175, 204, 197, 0.9)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(183, 211, 204)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(181, 181, 181)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0.5');

          // 75%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider75PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(128, 181, 169, 0.85)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(133, 185, 173)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(221, 221, 221)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0.25');

          // 100%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider100PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(45, 155, 135, 0.8)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(45, 155, 135)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(255, 255, 255)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0');
        });
      });
    });

    it('Slider button goes to the end of track if user drops it above 50% of slider width + animation after signature', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').check();

      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderDimensions = sliderEl[0].getBoundingClientRect();
        const sliderWidth = sliderDimensions.width;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

          const sliderButtonWidth = sliderButtonDimensions.width;

          const sliderTrackWidth =
            sliderWidth - sliderLeftPadding - sliderRightPadding - sliderButtonWidth;

          const pointerDownPageX = sliderButtonDimensions.x;
          const pointerMovePageX = sliderButtonDimensions.x + (sliderTrackWidth / 2 + 1);
          const pointerUpPageX = sliderDimensions.right - sliderRightPadding - sliderButtonWidth;

          cy.get('[data-test=PatronModeSlider__button]')
            .trigger('pointerdown', {
              pageX: pointerDownPageX,
            })
            .trigger('pointermove', {
              pageX: pointerMovePageX,
            })
            .wait(1000)
            .then(sliderButtonElAfterPointerMove => {
              const sliderButtonDimensionsAfterPointerMove =
                sliderButtonElAfterPointerMove[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerMove.x).eq(pointerMovePageX);
            })
            .trigger('pointerup')
            .wait(1000)
            .then(sliderButtonElAfterPointerUp => {
              const sliderButtonDimensionsAfterPointerUp =
                sliderButtonElAfterPointerUp[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerUp.x).eq(pointerUpPageX);
            });

          cy.confirmMetamaskSignatureRequest();
          cy.switchToCypressWindow();
          cy.get('[data-test=PatronModeSlider__button]').should('not.exist');
          cy.get('[data-test=PatronModeSlider__label]').should('not.exist');
          cy.get('[data-test=PatronModeSlider__status-label]')
            .invoke('text')
            .should('eq', 'Patron mode enabled');
          cy.wait(500);
          cy.get('[data-test=ModalPatronMode]').should('not.exist');
        });
      });
    });
  });

  describe(`patron mode (enabled): ${device}`, { viewportHeight, viewportWidth }, () => {
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
      localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
      localStorage.setItem(IS_ONBOARDING_DONE, 'true');
      localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
      visitWithLoader(ROOT_ROUTES.settings.absolute);
      connectWallet({ isPatronModeEnabled: true, isTOSAccepted: true });
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('patron badge is visible and has correct label, background and text-transform prop', () => {
      cy.get('[data-test=ProfileInfo__badge]').should('be.visible');
      cy.get('[data-test=ProfileInfo__badge]').invoke('text').should('eq', 'Patron');
      cy.get('[data-test=ProfileInfo__badge]')
        .should('have.css', 'background-color', 'rgb(104, 91, 138)')
        .should('have.css', 'text-transform', 'uppercase');
    });

    it('Navbar has 4 items - projects, earn, metrics, settings', () => {
      const navbarChildrenDataTest = [
        'Navbar__Button--Projects',
        'Navbar__Button--Earn',
        'Navbar__Button--Metrics',
        'Navbar__Button--Settings',
      ];

      cy.get('[data-test=Navbar__buttons]')
        .children()
        .should('have.length', navbarChildrenDataTest.length);

      for (let i = 0; i < navbarChildrenDataTest.length; i++) {
        cy.get('[data-test=Navbar__buttons]')
          .children()
          .eq(i)
          .invoke('data', 'test')
          .should('eq', navbarChildrenDataTest[i]);
      }
    });

    it('route /allocate redirects to /projects', () => {
      visitWithLoader(ROOT_ROUTES.allocation.absolute, ROOT_ROUTES.projects.absolute);
      cy.get('[data-test=ProjectsView]').should('be.visible');
    });

    it('BoxPersonalAllocation has correct title and sections labels', () => {
      navigateWithCheck(ROOT_ROUTES.earn.absolute);
      cy.get('[data-test=BoxPersonalAllocation__title]')
        .invoke('text')
        .should('eq', 'Patron earnings');
      cy.get('[data-test=BoxPersonalAllocation__Section__label]')
        .eq(0)
        .invoke('text')
        .should('eq', 'Current epoch');
      cy.get('[data-test=BoxPersonalAllocation__Section__label]')
        .eq(1)
        .invoke('text')
        .should('eq', 'All time');
    });

    it('Patron mode toggle is checked', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').should('be.checked');
    });

    if (isDesktop) {
      it('Patron mode tooltip is visible on hover and has correct text', () => {
        cy.get('[data-test=SettingsPatronModeBox__Tooltip]').trigger('mouseover');
        cy.get('[data-test=SettingsPatronModeBox__Tooltip__content]').should('be.visible');
        cy.get('[data-test=SettingsPatronModeBox__Tooltip__content]')
          .invoke('text')
          .should(
            'eq',
            'Patron mode is for token holders who want to support Octant. It disables allocation to yourself or projects. All rewards go directly to the matching fund with no action required by the patron.',
          );
      });
    }

    it('Unchecking patron mode opens patron mode modal', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=ModalPatronMode]').should('be.visible');
    });

    it('Patron mode modal last paragraph has correct text', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=SettingsPatronMode__fourthParagraph]')
        .invoke('text')
        .should('eq', 'Slide the switch below all the way to  the left to disable patron mode.');
    });

    it('Slider is visible', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=PatronModeSlider]').should('be.visible');
    });

    it('Slider has correct label', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=PatronModeSlider__label]')
        .invoke('text')
        .should('eq', 'Slide left to confirm');
    });

    it('Slider button is visible', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=PatronModeSlider__button]').should('be.visible');
    });

    it('Slider button has left arrow inside', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=PatronModeSlider__button__arrow]')
        .should('be.visible')
        .should('have.css', 'transform', 'matrix(-1, 0, 0, -1, 0, 0)');
    });

    it('Slider button is on the right side', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();
      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderRightDistance = sliderEl[0].getBoundingClientRect().right;
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonRightDistance = sliderButtonEl[0].getBoundingClientRect().right;

          expect(sliderButtonRightDistance).to.be.eq(sliderRightDistance - sliderRightPadding);
        });
      });
    });

    it('Slider button returns to the starting point if user drops it below or equal 50% of slider width', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();

      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderDimensions = sliderEl[0].getBoundingClientRect();
        const sliderWidth = sliderDimensions.width;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

          const sliderButtonWidth = sliderButtonDimensions.width;

          const sliderTrackWidth =
            sliderWidth - sliderLeftPadding - sliderRightPadding - sliderButtonWidth;

          const pointerDownPageX = sliderButtonDimensions.right;
          const pointerMovePageX = sliderButtonDimensions.right - sliderTrackWidth / 2;

          cy.get('[data-test=PatronModeSlider__button]')
            .trigger('pointerdown', {
              pageX: pointerDownPageX,
            })
            .trigger('pointermove', {
              pageX: pointerMovePageX,
            })
            .wait(1000)
            .then(sliderButtonElAfterPointerMove => {
              const sliderButtonDimensionsAfterPointerMove =
                sliderButtonElAfterPointerMove[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerMove.right).eq(pointerMovePageX);
            })
            .trigger('pointerup')
            .wait(1000)
            .then(sliderButtonElAfterPointerUp => {
              const sliderButtonDimensionsAfterPointerUp =
                sliderButtonElAfterPointerUp[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerUp.right).eq(pointerDownPageX);
            });
        });
      });
    });

    it('Slider elements change color while moving slider button', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();

      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderDimensions = sliderEl[0].getBoundingClientRect();
        const sliderWidth = sliderDimensions.width;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

          const sliderButtonWidth = sliderButtonDimensions.width;

          const sliderTrackWidth =
            sliderWidth - sliderLeftPadding - sliderRightPadding - sliderButtonWidth;

          const slider0PercentagePageX = sliderButtonDimensions.right;
          const slider25PercentagePageX = sliderButtonDimensions.right - sliderTrackWidth / 4;
          const slider50PercentagePageX = sliderButtonDimensions.right - sliderTrackWidth / 2;
          const slider75PercentagePageX = sliderButtonDimensions.right - 3 * (sliderTrackWidth / 4);
          const slider100PercentagePageX = sliderButtonDimensions.right - sliderTrackWidth;

          // 0%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointerdown', {
            pageX: slider0PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgb(243, 243, 243)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(255, 255, 255)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(23, 23, 23)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '1');

          // 25%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider25PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(212, 224, 221, 0.95)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(222, 234, 231)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(129, 129, 129)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0.75');

          // 50%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider50PercentagePageX,
            waitForAnimations: true,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(175, 204, 197, 0.9)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(183, 211, 204)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(181, 181, 181)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0.5');

          // 75%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider75PercentagePageX,
            waitForAnimations: true,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(128, 181, 169, 0.85)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(133, 185, 173)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(221, 221, 221)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0.25');

          // 100%
          cy.get('[data-test=PatronModeSlider__button]').trigger('pointermove', {
            pageX: slider100PercentagePageX,
          });
          cy.get('[data-test=PatronModeSlider]').should(
            'have.css',
            'background-color',
            'rgba(45, 155, 135, 0.8)',
          );
          cy.get('[data-test=PatronModeSlider__button]').should(
            'have.css',
            'background-color',
            'rgb(45, 155, 135)',
          );
          cy.get('[data-test=PatronModeSlider__button__arrow__path]').should(
            'have.css',
            'fill',
            'rgb(255, 255, 255)',
          );
          cy.get('[data-test=PatronModeSlider__label]')
            .should('have.css', 'color', 'rgb(158, 163, 158)')
            .should('have.css', 'opacity', '0');
        });
      });
    });

    it('Slider button goes to the end of track if user drops it above 50% of slider width + animation after signature', () => {
      cy.get('[data-test=SettingsPatronModeBox__InputToggle]').uncheck();

      cy.get('[data-test=PatronModeSlider]').then(sliderEl => {
        const sliderDimensions = sliderEl[0].getBoundingClientRect();
        const sliderWidth = sliderDimensions.width;
        const sliderLeftPadding = parseInt(sliderEl.css('paddingLeft'), 10);
        const sliderRightPadding = parseInt(sliderEl.css('paddingRight'), 10);

        cy.get('[data-test=PatronModeSlider__button]').then(sliderButtonEl => {
          const sliderButtonDimensions = sliderButtonEl[0].getBoundingClientRect();

          const sliderButtonWidth = sliderButtonDimensions.width;

          const sliderTrackWidth =
            sliderWidth - sliderLeftPadding - sliderRightPadding - sliderButtonWidth;

          const pointerDownPageX = sliderButtonDimensions.right;
          const pointerMovePageX = sliderButtonDimensions.right - (sliderTrackWidth / 2 + 1);
          const pointerUpPageX = sliderDimensions.left + sliderLeftPadding;

          cy.get('[data-test=PatronModeSlider__button]')
            .trigger('pointerdown', {
              pageX: pointerDownPageX,
            })
            .trigger('pointermove', {
              pageX: pointerMovePageX,
            })
            .wait(1000)
            .then(sliderButtonElAfterPointerMove => {
              const sliderButtonDimensionsAfterPointerMove =
                sliderButtonElAfterPointerMove[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerMove.right).eq(pointerMovePageX);
            })
            .trigger('pointerup')
            .wait(1000)
            .then(sliderButtonElAfterPointerUp => {
              const sliderButtonDimensionsAfterPointerUp =
                sliderButtonElAfterPointerUp[0].getBoundingClientRect();
              expect(sliderButtonDimensionsAfterPointerUp.x).eq(pointerUpPageX);
            });

          cy.confirmMetamaskSignatureRequest();
          cy.switchToCypressWindow();
          cy.get('[data-test=PatronModeSlider__button]').should('not.exist');
          cy.get('[data-test=PatronModeSlider__label]').should('not.exist');
          cy.get('[data-test=PatronModeSlider__status-label]')
            .invoke('text')
            .should('eq', 'Patron mode disabled');
          cy.wait(500);
          cy.get('[data-test=ModalPatronMode]').should('not.exist');
        });
      });
    });

    it('when entering project view, button icon changes to chevronLeft', () => {
      navigateWithCheck(ROOT_ROUTES.projects.absolute);
      cy.get('[data-test^=ProjectsView__ProjectsListItem').first().click();
      cy.get('[data-test=Navbar__Button--Projects]')
        .find('svg')
        // HTML tag can't be self-closing in CY.
        .should(
          'have.html',
          '<path stroke="#CDD1CD" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.515 24.485 10.029 16l8.486-8.485"></path>',
        );
    });
  });
});
