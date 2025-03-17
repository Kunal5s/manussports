
// Xata client for Netlify functions
const { buildClient } = require('@xata.io/client');

// Xata client is automatically configured using environment variables
// XATA_API_KEY and XATA_BRANCH are set in Netlify environment variables
exports.getXataClient = () => {
  // Initialize the Xata client using environment variables provided by Netlify
  const xata = buildClient();
  
  // Ensure we have a connection to the database
  console.log("Xata client initialized in Netlify function");
  
  return xata;
};
