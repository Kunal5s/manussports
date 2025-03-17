
// Xata client for Netlify functions
const { buildClient } = require('@xata.io/client');

// Xata client is automatically configured using environment variables
// XATA_API_KEY and XATA_BRANCH must be set in Netlify environment
exports.getXataClient = () => {
  const xata = buildClient();
  return xata;
};
