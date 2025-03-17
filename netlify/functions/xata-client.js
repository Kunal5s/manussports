
// Xata client for Netlify functions
const { buildClient } = require('@xata.io/client');

// Xata client configuration
exports.getXataClient = () => {
  // Initialize the Xata client using environment variables provided by Netlify
  // XATA_API_KEY and XATA_BRANCH are set in Netlify environment variables
  try {
    const xata = buildClient();
    console.log("Xata client initialized in Netlify function");
    return xata;
  } catch (error) {
    console.error("Error initializing Xata client:", error);
    throw new Error("Failed to initialize Xata client");
  }
};
