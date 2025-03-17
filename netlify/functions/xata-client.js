
// Xata client for Netlify functions
const { buildClient } = require('@xata.io/client');

// Xata client configuration with better error handling
exports.getXataClient = () => {
  try {
    // Initialize the Xata client using environment variables set in Netlify
    // No need to manually set XATA_API_KEY as it's configured in Netlify environment
    const xata = buildClient();
    console.log("Xata client initialized successfully in Netlify function");
    
    // Check if we can access the database
    if (!xata.db) {
      throw new Error("Xata database connection not established");
    }
    
    return xata;
  } catch (error) {
    console.error("Error initializing Xata client:", error);
    throw new Error(`Failed to initialize Xata client: ${error.message}`);
  }
};
