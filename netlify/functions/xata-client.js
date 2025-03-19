
// Xata client for Netlify functions
const { buildClient } = require('@xata.io/client');

// Xata client configuration with better error handling
exports.getXataClient = () => {
  try {
    // Initialize the Xata client using environment variables or hardcoded values as fallback
    const apiKey = process.env.XATA_API_KEY || "xau_QNGaxjicleu6dFRunfVpoSZWD46BC3Ru6";
    const databaseURL = process.env.XATA_DATABASE_URL || "https://Kunal-Sonpitre-s-workspace-uftkup.eu-central-1.xata.sh/db/my_blog_db";
    
    console.log("Initializing Xata client with URL:", databaseURL);
    
    // Initialize the Xata client
    const xata = buildClient({
      apiKey: apiKey,
      branch: process.env.XATA_BRANCH || 'main',
      databaseURL: databaseURL
    });
    
    console.log("Xata client initialized successfully in Netlify function");
    
    return xata;
  } catch (error) {
    console.log("Error initializing Xata client:", error);
    // Return a minimal client structure to prevent errors
    return {
      db: {
        articles: {
          getAll: async () => []
        }
      }
    };
  }
};
