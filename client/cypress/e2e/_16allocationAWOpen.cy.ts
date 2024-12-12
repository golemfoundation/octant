// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { connectWallet, mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import { moveTime, setupAndMoveToPlayground } from 'cypress/utils/moveTime';
import viewports from 'cypress/utils/viewports';
import { QUERY_KEYS } from 'src/api/queryKeys';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop }) => {
    describe(`[AW IS OPEN] Allocation: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
        cy.clearAllLocalStorage();
      });

      beforeEach(() => {
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(ROOT_ROUTES.home.absolute);
      });

      it('User with UQ score below 15 can allocate rewards to personal and to projects', () => {
        connectWallet({ isPatronModeEnabled: false, isUQScoreBelow15: true });
        cy.wait(5000);
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__link--projects]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
        }
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(0).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(1).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(2).click();
        cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('be.visible');
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
        }

        cy.wait(1000);
        cy.get('[data-test=AllocationSliderBox]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__section__value--0]')
          .invoke('text')
          .should('eq', '0 ETH');
        cy.get('[data-test=AllocationSliderBox__section__value--1]')
          .invoke('text')
          .should('not.eq', '0 ETH');

        cy.get('[data-test=AllocationNavigation__ctaButton]')
          .invoke('text')
          .should('eq', 'Confirm');
        cy.wait(1000);
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').then($thumb => {
          const { left: thumbLeft } = $thumb[0].getBoundingClientRect();
          const pageXStart = thumbLeft;
          const pageXEnd = thumbLeft + 200; // px

          cy.get('[data-test=AllocationSliderBox__Slider__thumb]')
            .trigger('mousedown', { pageX: pageXStart })
            .trigger('mousemove', { pageX: pageXEnd })
            .trigger('mouseup', { pageX: pageXEnd });

          cy.wait(1000);
          cy.get('[data-test=AllocationSliderBox__section__value--0]')
            .invoke('text')
            .should('not.eq', '0 ETH');
          cy.get('[data-test=AllocationSliderBox__section__value--1]')
            .invoke('text')
            .should('not.eq', '0 ETH');

          cy.get('[data-test=AllocationItem__InputText]').each(el => {
            expect(parseFloat(`${el.val()}`)).to.be.gt(0);
          });

          // reset
          cy.get('[data-test=AllocationNavigation__resetButton]').click();

          cy.wait(1000);
          cy.get('[data-test=AllocationSliderBox__section__value--0]')
            .invoke('text')
            .should('eq', '0 ETH');
          cy.get('[data-test=AllocationSliderBox__section__value--1]')
            .invoke('text')
            .should('not.eq', '0 ETH');

          cy.get('[data-test=AllocationItem__InputText]').each(el => {
            expect(parseFloat(`${el.val()}`)).to.be.eq(0);
          });

          cy.get('[data-test=AllocationSliderBox__Slider__thumb]')
            .trigger('mousedown', { pageX: pageXStart })
            .trigger('mousemove', { pageX: pageXEnd })
            .trigger('mouseup', { pageX: pageXEnd });

          cy.get('[data-test=AllocationSliderBox__section__value--0]')
            .invoke('text')
            .should('not.eq', '0 ETH');
          cy.get('[data-test=AllocationSliderBox__section__value--1]')
            .invoke('text')
            .should('not.eq', '0 ETH');

          cy.get('[data-test=AllocationItem__InputText]').each(el => {
            expect(parseFloat(`${el.val()}`)).to.be.gt(0);
          });

          cy.get('[data-test=AllocationNavigation__ctaButton]')
            .invoke('text')
            .should('eq', 'Confirm');
          cy.get('[data-test=AllocationNavigation__ctaButton]').click();
          cy.get('[data-test=ModalAllocationLowUqScore]').should('be.visible');
          cy.get('[data-test=AllocationLowUqScore__checkbox]').check();
          cy.get('[data-test=AllocationLowUqScore__ctaButton]').click();
          cy.get('[data-test=ModalAllocationLowUqScore]').should('not.exist');
          cy.wait(500);
          cy.get('[data-test=AllocationNavigation__ctaButton]').should('be.disabled');
          cy.get('[data-test=AllocationNavigation__ctaButton]')
            .invoke('text')
            .should('eq', 'Waiting');
          cy.confirmMetamaskDataSignatureRequest();
          cy.wait(1000);
          cy.get('[data-test=AllocationSummary]').should('exist');
          cy.get('[data-test=AllocationSummaryProject]').should('have.length', 3);
          cy.get('[data-test=AllocationSummary__totalDonated]').scrollIntoView();
          cy.get('[data-test=AllocationSummary__totalDonated]').should('be.visible');
          cy.get('[data-test=AllocationSummary__totalDonated__value]').then($totalDonated => {
            expect(parseFloat(`${$totalDonated.text()}`.replace('<', ''))).to.be.gt(0);
          });

          cy.get('[data-test=AllocationSummary__matchFunding]').scrollIntoView();
          cy.get('[data-test=AllocationSummary__matchFunding]').should('be.visible');
          cy.get('[data-test=AllocationSummary__matchFunding__value]').then($matchFunding => {
            expect(parseFloat(`${$matchFunding.text()}`.replace('<', ''))).to.be.gt(0);
          });
          cy.get('[data-test=AllocationSummary__totalImpact]').scrollIntoView();
          cy.get('[data-test=AllocationSummary__totalImpact]').should('be.visible');
          cy.get('[data-test=AllocationSummary__totalImpact__value]').then($totalImpact => {
            expect(parseFloat(`${$totalImpact.text()}`.replace('<', ''))).to.be.gt(0);
          });

          cy.get('[data-test=AllocationSummary__personalRewardBox]').scrollIntoView();
          cy.get('[data-test=AllocationSummary__personalRewardBox]').should('be.visible');
          cy.get('[data-test=AllocationSummary__personalReward]').then($personalReward => {
            expect(parseFloat(`${$personalReward.text()}`.replace('<', ''))).to.be.gt(0);
          });

          cy.get('[data-test=AllocationSliderBox__Slider__thumb]').scrollIntoView();
          cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.be.visible');
          cy.get('[data-test=AllocationNavigation__ctaButton]').invoke('text').should('eq', 'Edit');

          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=AllocationDrawer__closeButton]').click();
            cy.get('[data-test=LayoutTopBar__link--home]').click();
          } else {
            cy.get('[data-test=LayoutNavbar__Button--home]').click();
          }
          cy.wait(1000);
          cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
            .invoke('text')
            .should('eq', '3');

          cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('not.exist');
          cy.get('[data-test=DonationsList]').should('be.visible');
          cy.get('[data-test=DonationsList__item]').should('have.length', 3);
          cy.get('[data-test=DonationsList__item__value]').each($donationListItemValue => {
            expect(parseFloat(`${$donationListItemValue.text()}`.replace('<', ''))).to.be.gt(0);
          });

          cy.get('[data-test=TransactionsListItem__title]')
            .eq(0)
            .invoke('text')
            .should('eq', 'Allocated rewards');
        });
      });

      it('User can edit allocation and allocate everything to personal', () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
        cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
          .invoke('text')
          .should('eq', '3');

        cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('not.exist');
        cy.get('[data-test=DonationsList]').should('be.visible');
        cy.get('[data-test=DonationsList__item]').should('have.length', 3);

        cy.get('[data-test=TransactionsListItem__title]')
          .eq(0)
          .invoke('text')
          .should('eq', 'Allocated rewards');

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
        }
        cy.wait(1000);

        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.be.visible');
        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
        cy.get('[data-test=AllocationSummary]').should('exist');
        cy.get('[data-test=AllocationSummary__personalRewardBox]').scrollIntoView();
        cy.get('[data-test=AllocationSummary__personalRewardBox]').should('be.visible');

        cy.get('[data-test=AllocationNavigation__resetButton]')
          .invoke('text')
          .should('eq', 'Reset');
        cy.get('[data-test=AllocationNavigation__resetButton]').should('be.disabled');
        cy.get('[data-test=AllocationNavigation__ctaButton]').invoke('text').should('eq', 'Edit');
        cy.get('[data-test=AllocationNavigation__ctaButton]').click();

        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').scrollIntoView();
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('be.visible');
        cy.get('[data-test=AllocationRewardsBox]').scrollIntoView();
        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
        cy.get('[data-test=AllocationSummary]').should('not.exist');
        cy.get('[data-test=AllocationSummary__personalRewardBox]').should('not.exist');

        cy.get('[data-test=AllocationSliderBox__section--0]').click();
        cy.wait(500);
        cy.get('[data-test=ModalAllocationValuesEdit]').should('be.visible');
        cy.get('[data-test=AllocationInputs__InputText--crypto]').clear().type('0');
        cy.get('[data-test=AllocationInputs__Button]').click();
        cy.wait(500);
        cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');

        cy.wait(1000);
        cy.get('[data-test=AllocationSliderBox__section__value--0]')
          .invoke('text')
          .should('eq', '0 ETH');
        cy.get('[data-test=AllocationSliderBox__section__value--1]')
          .invoke('text')
          .should('not.eq', '0 ETH');

        cy.get('[data-test=AllocationNavigation__ctaButton]')
          .invoke('text')
          .should('eq', 'Confirm');
        cy.get('[data-test=AllocationNavigation__ctaButton]').click();
        cy.wait(500);
        cy.get('[data-test=AllocationNavigation__ctaButton]').should('be.disabled');
        cy.get('[data-test=AllocationNavigation__ctaButton]')
          .invoke('text')
          .should('eq', 'Waiting');
        cy.confirmMetamaskDataSignatureRequest();
        cy.wait(1000);

        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.be.visible');
        cy.get('[data-test=AllocationSummary]').should('not.exist');
        cy.get('[data-test=AllocationSummary__personalRewardBox]').should('be.visible');

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=AllocationDrawer__closeButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--home]').click();
        }
        cy.wait(1000);
        cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
        cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
          .invoke('text')
          .should('eq', '0');
        cy.get('[data-test=DonationsList]').should('not.exist');
        cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('be.visible');

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('not.exist');
        } else {
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('not.exist');
        }

        cy.get('[data-test=TransactionsListItem__title]')
          .eq(0)
          .invoke('text')
          .should('eq', 'Personal allocation');
      });
    });

    describe('move time - AW IS OPEN', () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
      });

      it('move time to the next open AW', () => {
        setupAndMoveToPlayground();

        cy.window().then(async win => {
          moveTime(win, 'nextEpochDecisionWindowOpen').then(() => {
            cy.get('[data-test=PlaygroundView]').should('be.visible');
            const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
              QUERY_KEYS.isDecisionWindowOpen,
            );
            expect(isDecisionWindowOpenAfter).to.be.true;
          });
        });
      });
    });
  },
);
