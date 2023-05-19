import mediaQueriesScss from './_mediaQueriesExportToJs.module.scss';

const mediaQueries = {
  desktopOnly: JSON.parse(mediaQueriesScss.desktopOnly),
  phoneOnly: JSON.parse(mediaQueriesScss.phoneOnly),
  tabletOnly: JSON.parse(mediaQueriesScss.tabletOnly),
} as {
  desktopOnly: string;
  phoneOnly: string;
  tabletOnly: string;
};

export const { phoneOnly, tabletOnly, desktopOnly } = mediaQueries;
