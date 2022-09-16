require('dotenv').config();

const PROPOSALS_BASE_URI = process.env.PROPOSALS_BASE_URI || 'http://localhost:9000/';

export {
  PROPOSALS_BASE_URI
};
