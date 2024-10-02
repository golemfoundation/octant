export type OrderOption =
  | 'randomized'
  | 'alphabeticalAscending'
  | 'alphabeticalDescending'
  | 'totalsDescending'
  | 'totalsAscending'
  | 'donorsDescending'
  | 'donorsAscending';

export type ProjectsDetailsSearchParameters = {
  epochs?: number[];
  searchPhrases?: string[];
};
