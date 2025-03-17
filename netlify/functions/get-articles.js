
// Netlify serverless function to get articles from Xata
const { getXataClient } = require('./xata-client');

exports.handler = async () => {
  try {
    const xata = getXataClient();
    
    // Get all articles from Xata
    const records = await xata.db.articles.getAll();
    
    // Parse content field back to article objects
    const articles = records.map(record => {
      try {
        return JSON.parse(record.content);
      } catch (e) {
        console.error('Error parsing article content:', e);
        return null;
      }
    }).filter(Boolean);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ articles })
    };
  } catch (error) {
    console.error('Failed to get articles:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get articles' })
    };
  }
};
