
// Netlify serverless function to fetch articles from Xata
const { getXataClient } = require('./xata-client');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  console.log("Starting get-articles function");
  
  try {
    const xata = getXataClient();
    console.log("Xata client retrieved successfully");
    
    // Access the articles table
    if (!xata.db || !xata.db.articles) {
      console.error("Articles table not found in Xata database");
      return {
        statusCode: 200, // Use 200 even for errors to avoid CORS issues with error status codes
        headers,
        body: JSON.stringify({ error: 'Articles table not found', articles: [] })
      };
    }
    
    try {
      console.log("Attempting to fetch articles from Xata");
      
      // Get all articles from Xata with pagination (max 200 articles)
      const articles = await xata.db.articles.getAll({
        pagination: { size: 200 }
      });
      
      console.log(`Retrieved ${articles ? articles.length : 0} articles from Xata`);
      
      if (!articles || articles.length === 0) {
        console.log("No articles found in Xata database");
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ articles: [] })
        };
      }
      
      // Parse the content field for each article
      const parsedArticles = articles.map(article => {
        try {
          if (!article.content) {
            console.warn(`Article ${article.id} has no content`);
            return null;
          }
          
          // The content field contains the full article object serialized as JSON
          return JSON.parse(article.content);
        } catch (e) {
          console.error(`Failed to parse article content for ID ${article.id}:`, e);
          return null;
        }
      }).filter(Boolean); // Remove any null entries
      
      console.log(`Successfully parsed ${parsedArticles.length} articles`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ articles: parsedArticles })
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      // Return an empty array in case of error to avoid breaking the frontend
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ articles: [], error: error.message })
      };
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return {
      statusCode: 200, // Use 200 even for errors to avoid CORS issues
      headers,
      body: JSON.stringify({ error: 'Failed to fetch articles: ' + error.message, articles: [] })
    };
  }
};
