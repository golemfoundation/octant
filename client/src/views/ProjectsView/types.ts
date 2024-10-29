export type OrderOption =
  | 'randomized'
  | 'alphabeticalAscending'
  | 'alphabeticalDescending'
  | 'totalsDescending'
  | 'totalsAscending'
  | 'donorsDescending'
  | 'donorsAscending';

export type ProjectsSearchParameters = {
  epochs?: number[];
  searchPhrases?: string[];
};
