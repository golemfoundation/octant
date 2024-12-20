// eslint-disable-next-line import/no-extraneous-dependencies
import chaiColors from 'chai-colors';

import { mockCoinPricesServer, visitWithLoader } from 'cypress/utils/e2e';
import viewports from 'cypress/utils/viewports';
import {
  HAS_ONBOARDING_BEEN_CLOSED,
  IS_ONBOARDING_ALWAYS_VISIBLE,
  IS_ONBOARDING_DONE,
  SHOW_HELP_VIDEOS,
} from 'src/constants/localStorageKeys';
import { ROOT_ROUTES } from 'src/routes/RootRoutes/routes';

chai.use(chaiColors);

Object.values(viewports).forEach(
  ({ device, viewportWidth, viewportHeight, isLargeDesktop, isDesktop, isTablet, isMobile }) => {
    describe(`[AW IS OPEN] Video bar: ${device}`, { viewportHeight, viewportWidth }, () => {
      before(() => {
        cy.clearLocalStorage();
      });

      beforeEach(() => {
        cy.intercept('https://api.vimeo.com/users/*/albums/*/videos', [
          {
            data: [
              {
                name: 'How to lock GLM in Octant',
                player_embed_url: 'https://player.vimeo.com/video/1018544156?h=e362bf71a2',
              },
              {
                name: 'How to allocate rewards in Octant',
                player_embed_url: 'https://player.vimeo.com/video/1018544104?h=cbb2f84a38',
              },
              {
                name: 'How to withdraw rewards in Octant',
                player_embed_url: 'https://player.vimeo.com/video/1018544172?h=d9559d5809',
              },
              {
                name: 'How to lock GLM in Octant',
                player_embed_url: 'https://player.vimeo.com/video/1018544156?h=e362bf71a2',
              },
              {
                name: 'How to allocate rewards in Octant',
                player_embed_url: 'https://player.vimeo.com/video/1018544104?h=cbb2f84a38',
              },
              {
                name: 'How to withdraw rewards in Octant',
                player_embed_url: 'https://player.vimeo.com/video/1018544172?h=d9559d5809',
              },
            ],
          },
        ]);
        mockCoinPricesServer();
        localStorage.setItem(IS_ONBOARDING_ALWAYS_VISIBLE, 'false');
        localStorage.setItem(IS_ONBOARDING_DONE, 'true');
        localStorage.setItem(HAS_ONBOARDING_BEEN_CLOSED, 'true');
        visitWithLoader(ROOT_ROUTES.home.absolute);
      });

      it('User can close video bar', { scrollBehavior: false }, () => {
        cy.get('[data-test=HomeGridVideoBar]').should('be.visible');
        cy.get('[data-test=HomeGridVideoBar]').scrollIntoView({ offset: { left: 0, top: -100 } });

        cy.get('[data-test=HomeGridVideoBar__Button]').click();
        cy.get('[data-test=HomeGridVideoBar]').should('not.exist');

        if (isLargeDesktop || isDesktop) {
          cy.get('[data-test=LayoutTopBar__settingsButton]').click();
        } else {
          cy.get(`[data-test=LayoutNavbar__Button--settings]`).click();
        }

        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').scrollIntoView({
          offset: { left: 0, top: -100 },
        });
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').should('not.be.checked');
        cy.getAllLocalStorage().then(() => {
          expect(localStorage.getItem(SHOW_HELP_VIDEOS)).eq('false');
        });
        cy.get('[data-test=SettingsShowHelpVideosBox__InputToggle]').click();
      });

      if (!isMobile) {
        it(
          'User opens video by clicking on video tile (large-desktop, desktop, tablet ->) and close by clicking on overlay or close button ',
          { scrollBehavior: false },
          () => {
            cy.get('[data-test=HomeGridVideoBar]').scrollIntoView({
              offset: { left: 0, top: -100 },
            });
            cy.get('[data-test=VideoTile]').should('exist');
            cy.get('[data-test=VideoTile]').eq(0).click();
            cy.wait(500);

            cy.get('[data-test=VideoTile__videoBox]').should('be.visible');
            cy.get('[data-test=VideoTile__videoBox__videoIframe]').should('be.visible');
            cy.get('[data-test=VideoTile__videoBox__overlay]').should('exist');
            cy.get('[data-test=VideoTile__videoBox__overlay]').click({ force: true });
            cy.wait(500);
            cy.get('[data-test=VideoTile__videoBox]').should('not.exist');
            cy.get('[data-test=VideoTile]').eq(0).click();
            cy.wait(500);
            cy.get('[data-test=VideoTile__videoBox__closeButton]').should('be.visible');
            cy.get('[data-testVideoTile__videoBox__closeButtonText]').should('not.exist');
            cy.get('[data-test=VideoTile__videoBox__closeButton]').realHover();
            cy.wait(500);
            cy.get('[data-test=VideoTile__videoBox]').should('be.visible');
            cy.get('[data-test=VideoTile__videoBox__videoIframe]').should('be.visible');
            cy.get('[data-test=VideoTile__videoBox__closeButtonText]').should('be.visible');
            cy.get('[data-test=VideoTile__videoBox__closeButton]').click();
            cy.wait(500);
            cy.get('[data-test=VideoTile__videoBox]').should('not.exist');
          },
        );
      }

      it('User can move video box by drag&drop ', { scrollBehavior: false }, () => {
        cy.get('[data-test=HomeGridVideoBar]').scrollIntoView({ offset: { left: 0, top: -100 } });
        cy.get('[data-test=VideoTile]').should('exist');

        cy.get('[data-test=VideoTile]').eq(0).should('be.visible');
        cy.get('[data-test=VideoTile]').then($videoTile => {
          const { right: pageXStartRight, left: pageXStartLeft } =
            $videoTile[0].getBoundingClientRect();
          const difference = isMobile || isTablet ? 280 + 24 : 392 + 24;

          const hidePageXEnd = pageXStartRight - difference;
          const showPageXEnd = pageXStartLeft + difference;

          cy.get('[data-test=VideoTile]')
            .eq(0)
            .trigger('pointerdown', { pageX: pageXStartRight })
            .trigger('pointermove', {
              pageX: hidePageXEnd,
            });

          cy.get('[data-test=VideoTile]').eq(0).should('not.be.visible');
          cy.get('[data-test=VideoTile]').eq(1).should('be.visible');
          cy.get('[data-test=VideoTile]')
            .eq(1)
            .trigger('pointerdown', { pageX: pageXStartLeft })
            .trigger('pointermove', {
              pageX: showPageXEnd,
            });
          cy.get('[data-test=VideoTile]').eq(0).should('be.visible');
        });
      });

      it('User can move to next/prev video using the arrows ', { scrollBehavior: false }, () => {
        const leftArrowDataTest = `HomeGridVideoBar__NavigationArrows${isMobile ? '--mobile' : ''}__leftArrow`;
        const rightArrowDataTest = `HomeGridVideoBar__NavigationArrows${isMobile ? '--mobile' : ''}__rightArrow`;
        cy.get('[data-test=HomeGridVideoBar]').scrollIntoView({ offset: { left: 0, top: -100 } });
        cy.get('[data-test=VideoTile]').should('exist');
        cy.get(`[data-test=${leftArrowDataTest}]`).should('be.visible');
        cy.get(`[data-test=${leftArrowDataTest}]`).should('be.disabled');
        cy.get(`[data-test=${rightArrowDataTest}]`).should('be.visible');
        cy.get(`[data-test=${rightArrowDataTest}]`).should('not.be.disabled');
        cy.get('[data-test=VideoTile]').eq(0).should('be.visible');
        cy.get(`[data-test=${rightArrowDataTest}]`).click();
        cy.get('[data-test=VideoTile]').eq(0).should('not.be.visible');
        cy.get(`[data-test=${leftArrowDataTest}]`).should('not.be.disabled');
        cy.get(`[data-test=${leftArrowDataTest}]`).click();
        cy.get('[data-test=VideoTile]').eq(0).should('be.visible');
        cy.get(`[data-test=${leftArrowDataTest}]`).should('be.disabled');
      });
    });
  },
);
