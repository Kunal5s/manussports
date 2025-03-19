
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
      console.log("Articles table not found in Xata database - returning empty array");
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ articles: [] })
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
        console.log("No articles found in Xata database - returning empty array");
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
            console.log(`Article ${article.id} has no content - skipping`);
            return null;
          }
          
          // The content field contains the full article object serialized as JSON
          return JSON.parse(article.content);
        } catch (e) {
          console.log(`Failed to parse article content for ID ${article.id} - skipping`);
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
      console.log("Error fetching articles - returning empty array:", error);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ articles: [] })
      };
    }
  } catch (error) {
    console.log('Failed to fetch articles - returning empty array:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ articles: [] })
    };
  }
};
