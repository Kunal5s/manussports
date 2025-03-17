
// Netlify serverless function to fetch articles from Xata
const { getXataClient } = require('./xata-client');

exports.handler = async (event) => {
  try {
    const xata = getXataClient();
    
    // Access the articles table
    const articlesTable = xata.db.articles;
    
    // Ensure the table exists
    try {
      // Get all articles from Xata
      const articles = await articlesTable.getAll();
      
      // Parse the content field for each article
      const parsedArticles = articles.map(article => {
        try {
          // The content field contains the full article object serialized as JSON
          return JSON.parse(article.content);
        } catch (e) {
          console.error(`Failed to parse article content for ID ${article.id}:`, e);
          return null;
        }
      }).filter(Boolean); // Remove any null entries
      
      return {
        statusCode: 200,
        body: JSON.stringify({ articles: parsedArticles })
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      // If table doesn't exist or other error, return empty array
      return {
        statusCode: 200,
        body: JSON.stringify({ articles: [] })
      };
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch articles' })
    };
  }
};
