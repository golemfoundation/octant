// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { navigateWithCheck } from 'cypress/utils/e2e';
import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import {
  beforeSetup,
  checkChangeStepsByClickingEdgeOfTheScreenMoreThan25px,
  checkChangeStepsByClickingEdgeOfTheScreenUpTo25px,
  checkChangeStepsBySwipingOnScreenDifferenceLessThanl5px,
  checkChangeStepsBySwipingOnScreenDifferenceMoreThanOrEqual5px,
  checkChangeStepsWithArrowKeys,
  checkProgressStepperSlimIsCurrentAndClickNext,
  connectWallet,
} from 'cypress/utils/onboarding';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import { HAS_ONBOARDING_BEEN_CLOSED, IS_ONBOARDING_DONE } from 'src/constants/localStorageKeys';
import { getStepsDecisionWindowOpen } from 'src/hooks/helpers/useOnboardingSteps/steps';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

describe('move time', () => {
  before(() => {
    /**
     * Global Metamask setup done by Synpress is not always done.
     * Since Synpress needs to have valid provider to fetch the data from contracts,
     * setupMetamask is required in each test suite.
     */
    cy.setupMetamask();
  });

  it('allocation window is open, when it is not, move time', () => {
    setupAndMoveToPlayground();

    cy.window().then(async win => {
      moveTime(win, 'nextEpochDecisionWindowOpen').then(() => {
        const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
          QUERY_KEYS.isDecisionWindowOpen,
        );
        expect(isDecisionWindowOpenAfter).to.be.true;
      });
    });
  });
});

Object.values(viewports).forEach(({ device, viewportWidth, viewportHeight, isDesktop }) => {
  describe(`onboarding (TOS accepted): ${device}`, { viewportHeight, viewportWidth }, () => {
    before(() => {
      beforeSetup();
    });

    beforeEach(() => {
      cy.clearLocalStorage();
      connectWallet(true);
    });

    after(() => {
      cy.disconnectMetamaskWalletFromAllDapps();
    });

    it('user is able to click through entire onboarding flow', () => {
      const onboardingSteps = getStepsDecisionWindowOpen('2', '16 Jan');

      for (let i = 1; i < onboardingSteps.length - 1; i++) {
        checkProgressStepperSlimIsCurrentAndClickNext(i);
      }

      cy.get('[data-test=ModalOnboarding__ProgressStepperSlim__element]')
        .eq(onboardingSteps.length - 1)
        .click();
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
      cy.get('[data-test=ProjectsView__ProjectsList]').should('be.visible');
    });

    it('user is able to close the modal by clicking button in the top-right', () => {
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
      cy.get('[data-test=ModalOnboarding__Button]').click();
      cy.get('[data-test=ModalOnboarding]').should('not.exist');
      cy.get('[data-test=ProjectsView__ProjectsList]').should('be.visible');
    });

    it('renders every time page is refreshed when "Always show Allocate onboarding" option is checked', () => {
      cy.get('[data-test=ModalOnboarding__Button]').click();
      navigateWithCheck(ROOT_ROUTES.settings.absolute);
      cy.get('[data-test=SettingsShowOnboardingBox__InputToggle]').check().should('be.checked');
      cy.reload();
      // For the unknown reason reloads sometimes cause app to disconnect in E2E env.
      cy.disconnectMetamaskWalletFromAllDapps();
      connectWallet(true);
      cy.get('[data-test=ModalOnboarding]').should('be.visible');
    });

    it('renders only once when "Always show Allocate onboarding" option is not checked', () => {
      cy.get('[data-test=ModalOnboarding__Button]').click();
      navigateWithCheck(ROOT_ROUTES.settings.absolute);
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
      const onboardingSteps = getStepsDecisionWindowOpen('2', '16 Jan');

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
      for (let i = 0; i < onboardingSteps.length - 1; i++) {
        cy.get(`[data-test=OnboardingStepper__circle--${i}]`)
          .then($el => $el.css('stroke'))
          .should('be.colored', i > 2 ? '#ffffff' : '#2d9b87');
      }
      cy.get('[data-test=OnboardingStepper]').click();
      checkProgressStepperSlimIsCurrentAndClickNext(3);
      cy.get('[data-test=ModalOnboarding__Button]').click();

      cy.get('[data-test=OnboardingStepper]').should('not.exist');
    });
  });
});
