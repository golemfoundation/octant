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
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop, isMobile }, idx) => {
    describe(`[AW IS OPEN] Allocation: ${device}`, { viewportHeight, viewportWidth }, () => {
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
        visitWithLoader(ROOT_ROUTES.home.absolute);
      });

      // TODO: Run for all devices after OCT-2283 (https://linear.app/golemfoundation/issue/OCT-2283/personal-allocation-arent-available-to-withdraw-in-pr-e2e-environment)
      if (idx === 0) {
        it('User doesn`t have personal rewards, can`t witdraw and can check pending tooltip', () => {
          cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current]').should(
            'be.visible',
          );
          cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__primary]')
            .invoke('text')
            .should('eq', '0 ETH');

          cy.get('[data-test=HomeGridPersonalAllocation__Section--pending]').should('be.visible');
          cy.get('[data-test=HomeGridPersonalAllocation--pending__primary]')
            .invoke('text')
            .should('eq', '0 ETH');

          cy.get('[data-test=HomeGridPersonalAllocation__Button]').should('be.disabled');
          cy.get('[data-test=HomeGridPersonalAllocation__Button]')
            .invoke('text')
            .should('eq', 'Withdraw to wallet');

          cy.get('[data-test=HomeGridPersonalAllocation--pending__Tooltip]').should('be.visible');
          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=HomeGridPersonalAllocation--pending__Tooltip]').trigger('mouseover');
          } else {
            cy.get('[data-test=HomeGridPersonalAllocation--pending__Tooltip]').click();
          }

          cy.get('[data-test=HomeGridPersonalAllocation--pending__Tooltip__content]').should(
            'exist',
          );

          connectWallet({ isPatronModeEnabled: false });
          cy.wait(5000);

          cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current]').should(
            'be.visible',
          );
          cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__primary]')
            .invoke('text')
            .should('eq', '0 ETH');

          cy.get('[data-test=HomeGridPersonalAllocation__Section--pending]').should('be.visible');
          cy.get('[data-test=HomeGridPersonalAllocation--pending__primary]')
            .invoke('text')
            .should('eq', '0 ETH');

          cy.get('[data-test=HomeGridPersonalAllocation__Button]')
            .invoke('text')
            .should('eq', 'Withdraw to wallet');

          cy.get('[data-test=HomeGridPersonalAllocation__Button]').click();
          cy.wait(1000);
          cy.get('[data-test=ModalWithdrawEth]').should('be.visible');
          cy.get('[data-test=WithdrawEth__Button]').invoke('text').should('eq', 'Withdraw all');
          cy.get('[data-test=WithdrawEth__Button]').should('be.disabled');
          cy.get('[data-test=ModalWithdrawEth__Button]').click();
          cy.wait(1000);
          cy.get('[data-test=ModalWithdrawEth]').should('not.exist');
        });
      }

      it('User with UQ score below 15 can allocate rewards to projects, ModalAllocationLowUqScore is shown to them', () => {
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
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('be.visible');
          // cy.get('[data-test=LayoutTopBar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('be.visible');
          // cy.get('[data-test=LayoutNavbar__numberOfAllocations]').invoke('text').should('eq', '3');
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

        cy.get('[data-test=AllocationNavigation__Button--cta]')
          .invoke('text')
          .should('eq', 'Confirm');
        cy.wait(1000);
        cy.get('[data-test=AllocationSliderBox__Slider]').then($slider => {
          const { right: sliderRight } = $slider[0].getBoundingClientRect();

          cy.get('[data-test=AllocationSliderBox__Slider__thumb]').then($thumb => {
            const { left: thumbLeft, width: thumbWidth } = $thumb[0].getBoundingClientRect();
            const pageXStart = thumbLeft + thumbWidth / 2;
            const pageXEnd = sliderRight;

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
              .should('eq', '0 ETH');

            cy.get('[data-test=AllocationItem__InputText]').each(el => {
              expect(parseFloat(`${el.val()}`)).to.be.gt(0);
            });

            // reset
            cy.get('[data-test=AllocationNavigation__Button--reset]').click();

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

            cy.get('[data-test=AllocationSliderBox__section--0]').click();
            cy.wait(500);
            cy.get('[data-test=ModalAllocationValuesEdit]').should('be.visible');
            cy.get('[data-test=AllocationInputs__InputText--percentage]').clear().type('100');
            cy.get('[data-test=AllocationInputs__Button]').click();
            cy.wait(500);
            cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');

            cy.get('[data-test=AllocationSliderBox__section__value--0]')
              .invoke('text')
              .should('not.eq', '0 ETH');
            cy.get('[data-test=AllocationSliderBox__section__value--1]')
              .invoke('text')
              .should('eq', '0 ETH');

            cy.get('[data-test=AllocationItem__InputText]').each(el => {
              expect(parseFloat(`${el.val()}`)).to.be.gt(0);
            });

            cy.get('[data-test=AllocationNavigation__Button--cta]')
              .invoke('text')
              .should('eq', 'Confirm');
            cy.get('[data-test=AllocationNavigation__Button--cta]').click();
            cy.get('[data-test=ModalAllocationLowUqScore]').should('be.visible');
            cy.get('[data-test=AllocationLowUqScore__InputCheckbox]').check();
            cy.get('[data-test=AllocationLowUqScore__Button--cta]').click();
            cy.get('[data-test=ModalAllocationLowUqScore]').should('not.exist');
            cy.wait(500);
            cy.get('[data-test=AllocationNavigation__Button--cta]').should('be.disabled');
            cy.get('[data-test=AllocationNavigation__Button--cta]')
              .invoke('text')
              .should('eq', 'Waiting');
            cy.confirmMetamaskDataSignatureRequest();
            cy.wait(1000);
            cy.get('[data-test=AllocationSummary]').should('exist');
            // cy.get('[data-test=AllocationSummaryProject]').should('have.length', 3);
            cy.wait(1000);
            cy.get('[data-test=AllocationSummary__totalDonated]').scrollIntoView();
            cy.get('[data-test=AllocationSummary__totalDonated]').should('be.visible');
            cy.get('[data-test=AllocationSummary__totalDonated__value--loading]').should(
              'not.exist',
            );
            cy.get('[data-test=AllocationSummary__totalDonated__value]').then($totalDonated => {
              expect(parseFloat(`${$totalDonated.text()}`.replace('<', ''))).to.be.gt(0);
            });

            cy.get('[data-test=AllocationSummary__matchFunding]').scrollIntoView();
            cy.get('[data-test=AllocationSummary__matchFunding]').should('be.visible');
            cy.get('[data-test=AllocationSummary__matchFunding__value--loading]').should(
              'not.exist',
            );
            cy.get('[data-test=AllocationSummary__matchFunding__value]').then($matchFunding => {
              expect(parseFloat(`${$matchFunding.text()}`.replace('<', ''))).to.be.gt(0);
            });
            cy.get('[data-test=AllocationSummary__totalImpact]').scrollIntoView();
            cy.get('[data-test=AllocationSummary__totalImpact]').should('be.visible');
            cy.get('[data-test=AllocationSummary__totalImpact__value]').then($totalImpact => {
              expect(parseFloat(`${$totalImpact.text()}`.replace('<', ''))).to.be.gt(0);
            });
            cy.get('[data-test=AllocationSummary__personalRewardBox]').should('not.exist');
            cy.get('[data-test=AllocationSliderBox__Slider__thumb]').scrollIntoView();
            cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.be.visible');
            cy.get('[data-test=AllocationNavigation__Button--cta]')
              .invoke('text')
              .should('eq', 'Edit');

            if (isLargeDesktop || isDesktop) {
              cy.get('[data-test=AllocationDrawer__closeButton]').click();
              cy.get('[data-test=LayoutTopBar__link--home]').click();
            } else {
              cy.get('[data-test=LayoutNavbar__Button--home]').click();
            }
            cy.wait(1000);
            cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
            // cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
            //   .invoke('text')
            //   .should('eq', '3');

            cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('not.exist');
            cy.get('[data-test=HomeGridDonations__Button--edit]').should('be.visible');
            cy.get('[data-test=DonationsList]').should('be.visible');
            // cy.get('[data-test=DonationsList__item]').should('have.length', 3);
            cy.get('[data-test=DonationsList__item__value]').each($donationListItemValue => {
              expect(parseFloat(`${$donationListItemValue.text()}`.replace('<', ''))).to.be.gt(0);
            });

            cy.get('[data-test=TransactionsListItem__title]')
              .eq(0)
              .invoke('text')
              .should('eq', 'Allocated rewards');

            cy.get('[data-test=TransactionsListItem__title]').eq(0).click();
            cy.wait(1000);
            cy.get('[data-test=ModalTransactionDetails]').should('be.visible');
            cy.get('[data-test=TransactionDetailsAllocation__personal]').should('be.visible');
            cy.get('[data-test=TransactionDetailsAllocation__personal--value__primary]')
              .invoke('text')
              .should('eq', '0 ETH');
            cy.get('[data-test=TransactionDetailsAllocation__allocationProjects__label]').should(
              'be.visible',
            );
            // .invoke('text')
            // .should('eq', 'Projects (3)');
            cy.get('[data-test=TransactionDetailsAllocation__allocationProjects]').should(
              'be.visible',
            );
            cy.get('[data-test=TransactionDetailsAllocation__finalMatchFunding]').should(
              'not.exist',
            );

            cy.get('[data-test=TransactionDetailsAllocation__estimatedLeverage]').should(
              'be.visible',
            );
            cy.get('[data-test=TransactionDetailsAllocation__projects]').scrollIntoView();
            cy.get('[data-test=TransactionDetailsAllocation__projects]').should('be.visible');
            cy.get('[data-test=TransactionDetailsAllocation__when]').should('be.visible');
            // cy.get('[data-test=ProjectAllocationDetailRow]').should('have.length', 3);
          });
        });
      });

      it('User can edit allocation and allocate everything to personal', () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
        // cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
        //   .invoke('text')
        //   .should('eq', '3');

        cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('not.exist');
        cy.get('[data-test=HomeGridDonations__Button--edit]').should('be.visible');
        cy.get('[data-test=DonationsList]').should('be.visible');
        // cy.get('[data-test=DonationsList__item]').should('have.length', 3);

        cy.get('[data-test=TransactionsListItem__title]')
          .eq(0)
          .invoke('text')
          .should('eq', 'Allocated rewards');

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('be.visible');
          // cy.get('[data-test=LayoutTopBar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutTopBar__allocationButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('be.visible');
          // cy.get('[data-test=LayoutNavbar__numberOfAllocations]').invoke('text').should('eq', '3');
          cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
        }
        cy.wait(1000);

        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.be.visible');
        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
        cy.get('[data-test=AllocationSummary]').should('exist');
        cy.get('[data-test=AllocationSummary__personalRewardBox]').should('not.exist');

        cy.get('[data-test=AllocationNavigation__Button--reset]')
          .invoke('text')
          .should('eq', 'Reset');
        cy.get('[data-test=AllocationNavigation__Button--reset]').should('be.disabled');
        cy.get('[data-test=AllocationNavigation__Button--cta]').invoke('text').should('eq', 'Edit');
        cy.get('[data-test=AllocationNavigation__Button--cta]').click();

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

        cy.get('[data-test=AllocationNavigation__Button--cta]')
          .invoke('text')
          .should('eq', 'Confirm');
        cy.get('[data-test=AllocationNavigation__Button--cta]').click();
        cy.wait(500);
        cy.get('[data-test=AllocationNavigation__Button--cta]').should('be.disabled');
        cy.get('[data-test=AllocationNavigation__Button--cta]')
          .invoke('text')
          .should('eq', 'Waiting');
        cy.confirmMetamaskDataSignatureRequest();
        cy.wait(1000);

        cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('not.be.visible');
        cy.get('[data-test=AllocationSummary]').should('not.exist');
        cy.get('[data-test=AllocationSummary__personalRewardBox]').scrollIntoView();
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

        cy.wait(1000);
        cy.get('[data-test=TransactionsListItem__DoubleValue__primary]').should('exist');
        cy.get('[data-test=TransactionsListItem]').eq(0).click();
        cy.get('[data-test=ModalTransactionDetails]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__personal]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__personal--value__primary]')
          .invoke('text')
          .should('not.eq', '0 ETH');
        cy.get('[data-test=TransactionDetailsAllocation__allocationProjects]').should('not.exist');
        cy.get('[data-test=TransactionDetailsAllocation__finalMatchFunding]').should('not.exist');

        cy.get('[data-test=TransactionDetailsAllocation__estimatedLeverage]').should('not.exist');
        cy.get('[data-test=TransactionDetailsAllocation__when]').should('be.visible');
        cy.get('[data-tes2st=TransactionDetailsAllocation__projects]').should('not.exist');
      });

      it('User can edit allocation by clicking on `Edit` button in Donations tile (HomeView) and allocate 50% to Personal and 50% to four projects', () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__link--projects]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--projects]').click();
        }
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(0).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(1).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(2).click();
        cy.get('[data-test=ProjectsListItem__ButtonAddToAllocate]').eq(3).click();

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=LayoutTopBar__numberOfAllocations]').invoke('text').should('eq', '4');
          cy.get('[data-test=LayoutTopBar__link--home]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('be.visible');
          cy.get('[data-test=LayoutNavbar__numberOfAllocations]').invoke('text').should('eq', '4');
          cy.get('[data-test=LayoutNavbar__Button--home]').click();
        }

        cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
        cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
          .invoke('text')
          .should('eq', '0');
        cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('be.visible');
        cy.get('[data-test=HomeGridDonations__Button--edit]').click();

        cy.wait(1000);
        cy.get('[data-test=AllocationSliderBox]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__Slider__thumb]').should('be.visible');
        cy.get('[data-test=AllocationSliderBox__section__value--0]')
          .invoke('text')
          .should('eq', '0 ETH');
        cy.get('[data-test=AllocationSliderBox__section__value--1]')
          .invoke('text')
          .should('not.eq', '0 ETH');

        cy.wait(5000);

        cy.get('[data-test=AllocationItem]').should('have.length', 4);
        cy.get('[data-test=AllocationItem__InputText]').each(el => {
          expect(parseFloat(`${el.val()}`)).to.be.eq(0);
        });

        cy.get('[data-test=AllocationSliderBox__section--1]').click();
        cy.wait(500);
        cy.get('[data-test=ModalAllocationValuesEdit]').should('be.visible');
        cy.get('[data-test=AllocationInputs__InputText--percentage]').clear().type('50');
        cy.get('[data-test=AllocationInputs__Button]').click();
        cy.wait(500);
        cy.get('[data-test=ModalAllocationValuesEdit]').should('not.exist');

        cy.get('[data-test=AllocationItem__InputText]').each(el => {
          expect(parseFloat(`${el.val()}`)).to.be.gt(0);
        });

        cy.get('[data-test=AllocationNavigation__Button--cta]')
          .invoke('text')
          .should('eq', 'Confirm');
        cy.get('[data-test=AllocationNavigation__Button--cta]').click();
        cy.wait(500);
        cy.get('[data-test=AllocationNavigation__Button--cta]').should('be.disabled');
        cy.get('[data-test=AllocationNavigation__Button--cta]')
          .invoke('text')
          .should('eq', 'Waiting');
        cy.confirmMetamaskDataSignatureRequest();
        cy.wait(1000);
        cy.get('[data-test=AllocationSummary]').should('exist');
        cy.get('[data-test=AllocationSummaryProject]').should('have.length', 4);
        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=AllocationDrawer__closeButton]').click();
        } else {
          cy.get('[data-test=LayoutNavbar__Button--home]').click();
        }
        cy.wait(1000);
        cy.get('[data-test=HomeGridDonations__numberOfAllocations]').should('be.visible');
        cy.get('[data-test=HomeGridDonations__numberOfAllocations]')
          .invoke('text')
          .should('eq', '4');

        cy.get('[data-test=HomeGridDonations__noDonationsYet]').should('not.exist');
        cy.get('[data-test=DonationsList]').should('be.visible');
        cy.get('[data-test=DonationsList__item]').should('have.length', 4);
        cy.get('[data-test=DonationsList__item__value]').each($donationListItemValue => {
          expect(parseFloat(`${$donationListItemValue.text()}`.replace('<', ''))).to.be.gt(0);
        });

        cy.wait(2500);
        cy.get('[data-test=TransactionsListItem__title]')
          .eq(0)
          .invoke('text')
          .should('eq', 'Allocated rewards');

        cy.wait(1000);
        cy.get('[data-test=TransactionsListItem__DoubleValue__primary]').should('exist');
        cy.get('[data-test=TransactionsListItem]').eq(0).click();
        cy.get('[data-test=ModalTransactionDetails]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__personal]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__personal--value__primary]')
          .invoke('text')
          .should('not.eq', '0 ETH');
        cy.get('[data-test=TransactionDetailsAllocation__allocationProjects__label]')
          .invoke('text')
          .should('eq', 'Projects (4)');
        cy.get('[data-test=TransactionDetailsAllocation__allocationProjects]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__finalMatchFunding]').should('not.exist');
        cy.get('[data-test=TransactionDetailsAllocation__estimatedLeverage]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__projects]').scrollIntoView();
        cy.get('[data-test=TransactionDetailsAllocation__projects]').should('be.visible');
        cy.get('[data-test=TransactionDetailsAllocation__when]').should('be.visible');
        cy.get('[data-test=ProjectAllocationDetailRow]').should('have.length', 4);
      });

      it('User has pending personal rewards', () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current]').should('be.visible');
        cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__primary]')
          .invoke('text')
          .should('eq', '0 ETH');

        cy.get('[data-test=HomeGridPersonalAllocation__Section--pending]').should('be.visible');
        cy.get('[data-test=HomeGridPersonalAllocation--pending__primary]')
          .invoke('text')
          .should('not.eq', '0 ETH');

        cy.get('[data-test=HomeGridPersonalAllocation__Button]')
          .invoke('text')
          .should('eq', 'Withdraw to wallet');

        cy.get('[data-test=HomeGridPersonalAllocation__Button]').click();
        cy.wait(1000);
        cy.get('[data-test=ModalWithdrawEth]').should('be.visible');
        cy.get('[data-test=WithdrawEth__Button]').invoke('text').should('eq', 'Withdraw all');
        cy.get('[data-test=WithdrawEth__Button]').should('be.disabled');
      });

      it('Epoch results graph shows donated projects', () => {
        connectWallet({ isPatronModeEnabled: false });
        cy.wait(5000);

        cy.get('[data-test=EpochResults__Img--headphonesGirl]').should('not.exist');
        cy.get('[data-test=EpochResultsDetails]').should('be.visible');
        cy.get('[data-test=EpochResultsDetails__loading]').should('not.exist');
        cy.get('[data-test=EpochResultsBar]').should('have.length', 4);

        if (isMobile) {
          cy.get('[data-test=EpochResultsBar]').eq(0).click();
        } else {
          cy.get('[data-test=EpochResultsBar]').eq(0).trigger('mouseover');
        }

        cy.get('[data-test=EpochResultsBar__projectLogo]').should('be.visible');
        cy.get('[data-test=EpochResultsDetails__projectName]').should('be.visible');
        cy.get('[data-test=EpochResultsDetails__donations]').should('be.visible');
        cy.get('[data-test=EpochResultsDetails__matching]').should('be.visible');
        cy.get('[data-test=EpochResultsDetails__total]').should('be.visible');
        if (!isMobile) {
          cy.get('[data-test=EpochResultsDetails__Button--visitProject]').should('be.visible');
        }
      });
    });

    describe('move time - AW IS CLOSED', () => {
      before(() => {
        /**
         * Global Metamask setup done by Synpress is not always done.
         * Since Synpress needs to have valid provider to fetch the data from contracts,
         * setupMetamask is required in each test suite.
         */
        cy.setupMetamask();
      });

      it('move time to closed AW', () => {
        setupAndMoveToPlayground();

        cy.window().then(async win => {
          moveTime(win, 'decisionWindowClosed').then(() => {
            cy.get('[data-test=PlaygroundView]').should('be.visible');
            const isDecisionWindowOpenAfter = win.clientReactQuery.getQueryData(
              QUERY_KEYS.isDecisionWindowOpen,
            );
            expect(isDecisionWindowOpenAfter).to.be.false;
          });
        });
      });
    });

    describe(
      `[AW IS CLOSED] After allocation: ${device}`,
      { viewportHeight, viewportWidth },
      () => {
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
          localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
          visitWithLoader(ROOT_ROUTES.home.absolute);
        });

        it('Donations tile shows donations history and the last transaction is the last user allocation', () => {
          connectWallet({ isPatronModeEnabled: false });
          cy.wait(5000);

          cy.get('[data-test=TransactionsListItem__DoubleValue__DoubleValueSkeleton]').should(
            'not.exist',
          );
          cy.get('[data-test=TransactionsListItem__DoubleValue__primary]').should('exist');

          cy.get('[data-test=HomeGridDonations__title]')
            .invoke('text')
            .should('eq', 'Donation history');
          cy.get('[data-test=DonationsList__item]').should('have.length.gte', 4);

          cy.get('[data-test=TransactionsListItem__title]')
            .eq(0)
            .invoke('text')
            .should('eq', 'Allocated rewards');

          cy.wait(1000);
          cy.get('[data-test=TransactionsListItem__DoubleValue__primary]').should('exist');
          cy.get('[data-test=TransactionsListItem]').eq(0).click();
          cy.get('[data-test=ModalTransactionDetails]').should('be.visible');
          cy.get('[data-test=TransactionDetailsAllocation__personal]').should('be.visible');
          cy.get('[data-test=TransactionDetailsAllocation__personal--value__primary]')
            .invoke('text')
            .should('not.eq', '0 ETH');
          cy.get('[data-test=TransactionDetailsAllocation__allocationProjects__label]')
            .invoke('text')
            .should('eq', 'Projects (4)');
          cy.get('[data-test=TransactionDetailsAllocation__allocationProjects]').should(
            'be.visible',
          );
          cy.get('[data-test=TransactionDetailsAllocation__finalMatchFunding]').should(
            'be.visible',
          );
          cy.get('[data-test=TransactionDetailsAllocation__estimatedLeverage]').should('not.exist');
          cy.get('[data-test=TransactionDetailsAllocation__projects]').scrollIntoView();
          cy.get('[data-test=TransactionDetailsAllocation__projects]').should('be.visible');
          cy.get('[data-test=TransactionDetailsAllocation__when]').should('be.visible');
          cy.get('[data-test=ProjectAllocationDetailRow]').should('have.length', 4);
        });

        it('Allocation summary is visible and allocation action buttons are disabled', () => {
          connectWallet({ isPatronModeEnabled: false });
          cy.wait(5000);

          if (isLargeDesktop || isDesktop) {
            cy.get('[data-test=LayoutTopBar__numberOfAllocations]').should('not.exist');
            cy.get('[data-test=LayoutTopBar__allocationButton]').click();
          } else {
            cy.get('[data-test=LayoutNavbar__numberOfAllocations]').should('not.exist');
            cy.get('[data-test=LayoutNavbar__Button--allocate]').click();
          }

          cy.wait(1000);

          cy.get('[data-test=AllocationRewardsBox]').scrollIntoView();
          cy.get('[data-test=AllocationRewardsBox]').should('be.visible');
          cy.get('[data-test=AllocationSliderBox]').should('not.exist');

          cy.get('[data-test=AllocationSummary]').should('exist');
          cy.get('[data-test=AllocationSummaryProject]').should('have.length', 4);
          cy.wait(1000);
          cy.get('[data-test=AllocationSummary__totalDonated]').scrollIntoView();
          cy.get('[data-test=AllocationSummary__totalDonated]').should('be.visible');
          cy.get('[data-test=AllocationSummary__totalDonated__value--loading]').should('not.exist');
          cy.get('[data-test=AllocationSummary__totalDonated__value]').then($totalDonated => {
            expect(parseFloat(`${$totalDonated.text()}`.replace('<', ''))).to.be.gt(0);
          });

          cy.get('[data-test=AllocationSummary__matchFunding]').scrollIntoView();
          cy.get('[data-test=AllocationSummary__matchFunding]').should('be.visible');
          cy.get('[data-test=AllocationSummary__matchFunding__value--loading]').should('not.exist');
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
          cy.get('[data-test=AllocationSummary__personalReward--loading]').should('not.exist');
          cy.get('[data-test=AllocationSummary__personalReward]').then($personalReward => {
            expect(parseFloat(`${$personalReward.text()}`.replace('<', ''))).to.be.gt(0);
          });

          cy.get('[data-test=AllocationNavigation__Button--reset]').should('be.disabled');
          cy.get('[data-test=AllocationNavigation__Button--reset]')
            .invoke('text')
            .should('eq', 'Reset');

          cy.get('[data-test=AllocationNavigation__Button--cta]').should('be.disabled');
          cy.get('[data-test=AllocationNavigation__Button--cta]')
            .invoke('text')
            .should('eq', 'Edit');
        });

        it('User has pending personal rewards', () => {
          connectWallet({ isPatronModeEnabled: false });
          cy.wait(5000);

          cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current]').should(
            'be.visible',
          );
          cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__primary]')
            .invoke('text')
            .should('eq', '0 ETH');

          cy.get('[data-test=HomeGridPersonalAllocation__Section--pending]').should('be.visible');
          cy.get('[data-test=HomeGridPersonalAllocation--pending__primary]')
            .invoke('text')
            .should('not.eq', '0 ETH');

          cy.get('[data-test=HomeGridPersonalAllocation__Button]')
            .invoke('text')
            .should('eq', 'Withdraw to wallet');

          cy.get('[data-test=HomeGridPersonalAllocation__Button]').click();
          cy.wait(1000);
          cy.get('[data-test=ModalWithdrawEth]').should('be.visible');
          cy.get('[data-test=WithdrawEth__Button]').invoke('text').should('eq', 'Withdraw all');
          cy.get('[data-test=WithdrawEth__Button]').should('be.disabled');
        });
      },
    );

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

    // TODO: To do after OCT-2283 (https://linear.app/golemfoundation/issue/OCT-2283/personal-allocation-arent-available-to-withdraw-in-pr-e2e-environment)
    // describe(`[AW IS OPEN] After allocation: ${device}`, { viewportHeight, viewportWidth }, () => {
    //   before(() => {
    //     /**
    //      * Global Metamask setup done by Synpress is not always done.
    //      * Since Synpress needs to have valid provider to fetch the data from contracts,
    //      * setupMetamask is required in each test suite.
    //      */
    //     cy.setupMetamask();
    //   });

    //   beforeEach(() => {
    //     mockCoinPricesServer();
    //     localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
    //     localStorage.setItem(IS_ONBOARDING_DONE, 'true');
    //     localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
    //     visitWithLoader(ROOT_ROUTES.home.absolute);
    //   });

    //   it('User has personal rewards, can withdraw rewards to wallet and the last transaction is "Withdrawn funds"', () => {
    //     connectWallet({ isPatronModeEnabled: false });
    //     cy.wait(5000);

    //     cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current]').should('be.visible');
    //     cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__primary]')
    //       .invoke('text')
    //       .should('not.eq', '0 ETH');

    //     cy.get('[data-test=HomeGridPersonalAllocation__Section--pending]').should('be.visible');
    //     cy.get('[data-test=HomeGridPersonalAllocation--pending__primary]')
    //       .invoke('text')
    //       .should('eq', '0 ETH');

    //     cy.get('[data-test=HomeGridPersonalAllocation__Button]')
    //       .invoke('text')
    //       .should('eq', 'Withdraw to wallet');

    //     cy.get('[data-test=HomeGridPersonalAllocation__Button]').click();

    //     cy.get('[data-test=ModalWithdrawEth]').should('be.visible');
    //     cy.get('[data-test=WithdrawEth__Button]').invoke('text').should('eq', 'Withdraw all');
    //     cy.get('[data-test=WithdrawEth__Section--amount__DoubleValueSkeleton]').should('not.exist');
    //     cy.get('[data-test=WithdrawEth__Section--estGasPrice__DoubleValueSkeleton]').should(
    //       'not.exist',
    //     );
    //     cy.get('[data-test=WithdrawEth__Button]').click();
    //     cy.get('[data-test=WithdrawEth__Button]').should('be.disabled');
    //     cy.get('[data-test=WithdrawEth__Button]')
    //       .invoke('text')
    //       .should('eq', 'Waiting for confirmation');

    //     cy.confirmMetamaskTransaction({ gasConfig: 'aggressive' });
    //     cy.wait(2500);

    //     cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__DoubleValueSkeleton]').should(
    //       'not.exist',
    //     );
    //     cy.get('[data-test=HomeGridPersonalAllocation--pending__DoubleValueSkeleton]').should(
    //       'not.exist',
    //     );

    //     cy.wait(1000);

    //     cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current]').should('be.visible');
    //     cy.get('[data-test=HomeGridPersonalAllocation__DoubleValue--current__primary]')
    //       .invoke('text')
    //       .should('eq', '0 ETH');

    //     cy.get('[data-test=HomeGridPersonalAllocation__Section--pending]').should('be.visible');
    //     cy.get('[data-test=HomeGridPersonalAllocation--pending__primary]')
    //       .invoke('text')
    //       .should('eq', '0 ETH');

    //     cy.get('[data-test=TransactionsListItem__title]')
    //       .eq(0)
    //       .invoke('text')
    //       .should('eq', 'Withdrawn funds');

    //     cy.get('[data-test=HomeGridPersonalAllocation__Button]').click();
    //     cy.wait(1000);
    //     cy.get('[data-test=ModalWithdrawEth]').should('be.visible');
    //     cy.get('[data-test=WithdrawEth__Button]').invoke('text').should('eq', 'Withdraw all');
    //     cy.get('[data-test=WithdrawEth__Button]').should('be.disabled');
    //   });
    // });
  },
);
