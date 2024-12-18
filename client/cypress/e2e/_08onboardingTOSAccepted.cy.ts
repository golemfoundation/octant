// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import {
  beforeSetup,
  checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px,
  checkChangeStepsByClickingEdgeOfTheScreenUpTo25px,
  checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px,
  checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px,
  checkChangeStepsWithArrowKeys,
  checkProgressStepperSlimIsCurrentAndClickNext,
  connectWalletOnboarding,
} from 'cypress/utils/onboarding';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import { HAS_ONBOARDING_BEEN_CLOSED, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import {
  getStepsDecisionWindowClosed,
  getStepsDecisionWindowOpen,
} from 'src/hooks/helpers/useOnboardingSteps/steps';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isDesktop, isLargeDesktop }) => {
    describe(
      `[AW IS CLOSED] onboarding (TOS accepted): ${device}`,
      { viewportHeight, viewportWidth },
      () => {
        before(() => {
          beforeSetup();
        });

        beforeEach(() => {
          cy.clearLocalStorage();
          connectWalletOnboarding();
        });

        after(() => {
          cy.disconnectMetamaskWalletFromAllDapps();
        });

        it('user is able to click through entire onboarding flow', () => {
          cy.window().then(win => {
            const isDecisionWindowOpen = win.clientReactQuery.getQueryData(
              QUERY_KEYS.isDecisionWindowOpen,
            );

            const onboardingSteps = isDecisionWindowOpen
              ? getStepsDecisionWindowOpen('2', '16 Jan')
              : getStepsDecisionWindowClosed('2', '16 Jan');

            for (let i = 1; i < onboardingSteps.length - 1; i++) {
              checkProgressStepperSlimIsCurrentAndClickNext(i);
            }

            cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
              .eq(onboardingSteps.length - 1)
              .click();
            cy.get('[data-test=ModalOnboarding__Button]').click();
            cy.get('[data-test=ModalOnboarding]').should('not.exist');
            cy.get('[data-test=HomeView]').should('be.visible');
          });
        });

        it('user is able to close the modal by clicking button in the top-right', () => {
          cy.get('[data-test=ModalOnboarding]').should('be.visible');
          cy.get('[data-test=ModalOnboarding__Button]').click();
          cy.get('[data-test=ModalOnboarding]').should('not.exist');
          cy.get('[data-test=HomeView]').should('be.visible');
        });

        it('renders every time page is refreshed when "Always show Allocate onboarding" option is checked', () => {
          cy.wait(2000);
          cy.get('[data-test=ModalOnboarding__Button]').click();
          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=LayoutTopBar__settingsButton]').click();
          } else {
            cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
          }
          cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').check().should('be.checked');
          cy.get('[data-test=ModalOnboarding]').should('be.visible');
          cy.get('[data-test=ModalOnboarding__Button]').click();
          cy.reload();
          cy.wait(1000);
          cy.get('[data-test=ModalOnboarding]').should('be.visible');
        });

        it('renders only once when "Always show Allocate onboarding" option is not checked', () => {
          cy.wait(2000);
          cy.get('[data-test=ModalOnboarding__Button]').click();
          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=LayoutTopBar__settingsButton]').click();
          } else {
            cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
          }
          cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').should('not.be.checked');
          cy.reload();
          cy.get('[data-test=ModalOnboarding]').should('not.exist');
        });

        it('user can change steps with arrow keys (left, right)', () => {
          checkChangeStepsWithArrowKeys(true);
        });

        it('user can change steps by clicking the edge of the screen (up to 25px from each edge)', () => {
          checkChangeStepsByClickingEdgeOfTheScreenUpTo25px(true);
        });

        it('user cannot change steps by clicking the edge of the screen (more than 25px from each edge)', () => {
          checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px(true);
        });

        it('user can change steps by swiping on screen (difference more than or equal 5px)', () => {
          checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px(true);
        });

        it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
          checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px(true);
        });

        it('user cannot change steps by swiping on screen (difference less than 5px)', () => {
          checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px(true);
        });

        it('user is able to close the onboarding, and after page reload, onboarding does not show up again', () => {
          cy.get('[data-test=ModalOnboarding]').should('be.visible');
          cy.get('[data-test=ModalOnboarding__Button]').click();
          cy.get('[data-test=ModalOnboarding]').should('not.exist');
          cy.reload();
          cy.get('[data-test=ModalOnboarding]').should('not.exist');
        });

        it('Onboarding stepper is visible after closing onboarding modal without going to the last step', () => {
          cy.get('[data-test=ModalOnboarding__Button]').click();
          cy.get('[data-test=OnboardingStepper]').should('be.visible');
        });

        it('Onboarding stepper opens onboarding modal', () => {
          cy.get('[data-test=ModalOnboarding__Button]').click();
          cy.get('[data-test=ModalOnboarding]').should('not.exist');
          cy.get('[data-test=OnboardingStepper]').click();
          cy.get('[data-test=ModalOnboarding]').should('be.visible');
        });

        it(`Onboarding stepper is not visible if "${IS_ONBOARDING_DONE}" is set to "true"`, () => {
          localStorage.setItem(IS_ONBOARDING_DONE, 'true');
          localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
          cy.reload();
          cy.get('[data-test=ModalOnboarding]').should('not.exist');
          cy.get('[data-test=OnboardingStepper]').should('not.exist');
        });

        if (isDesktop) {
          it(`Onboarding stepper has tooltip`, () => {
            cy.get('[data-test=ModalOnboarding__Button]').click();
            cy.get('[data-test=OnboardingStepper]').trigger('mouseover');
            cy.get('[data-test=OnboardingStepper__Tooltip__content]').should('be.visible');
            cy.get('[data-test=OnboardingStepper__Tooltip__content]')
              .invoke('text')
              .should('eq', 'Reopen onboarding');
          });
        }

        it('Onboarding stepper has right amount of steps and highlights correct amount of passed steps', () => {
          const onboardingSteps = getStepsDecisionWindowClosed('2', '16 Jan');

          cy.get('[data-test=ModalOnboarding__Button]').click();

          cy.get(`[data-test*=OnboardingStepper__circle]`).should(
            'have.length',
            onboardingSteps.length,
          );

          for (let i = 0; i < onboardingSteps.length - 1; i++) {
            cy.get(`[data-test=OnboardingStepper__circle--${i}]`)
              .then($el => $el.css('stroke'))
              .should('be.colored', i > 0 ? '#ffffff' : '#2d9b87');
          }
          cy.get('[data-test=OnboardingStepper]').click();
          checkProgressStepperSlimIsCurrentAndClickNext(1);
          cy.get('[data-test=ModalOnboarding__Button]').click();
          for (let i = 0; i < onboardingSteps.length - 1; i++) {
            cy.get(`[data-test=OnboardingStepper__circle--${i}]`)
              .then($el => $el.css('stroke'))
              .should('be.colored', i > 1 ? '#ffffff' : '#2d9b87');
          }
          cy.get('[data-test=OnboardingStepper]').click();
          checkProgressStepperSlimIsCurrentAndClickNext(2);
          cy.get('[data-test=ModalOnboarding__Button]').click();
          cy.get('[data-test=OnboardingStepper]').should('not.exist');
        });
      },
    );
  },
);
