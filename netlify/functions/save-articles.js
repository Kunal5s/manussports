
// Netlify serverless function to save articles to Xata
const { getXataClient } = require('./xata-client');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }
  
  try {
    const xata = getXataClient();
    let articles;
    
    try {
      articles = JSON.parse(event.body).articles;
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    if (!articles || !Array.isArray(articles)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid articles data' })
      };
    }
    
    const results = [];
    
    // Save each article to Xata
    for (const article of articles) {
      try {
        if (!article.id) {
          console.error("Article missing ID:", article);
          results.push({ id: 'unknown', success: false, error: 'Missing article ID' });
          continue;
        }
        
        // Create or update the article in Xata
        await xata.db.articles.createOrReplace({
          id: article.id,
          title: article.title || '',
          feature_image: article.featuredImage || '',
          content: JSON.stringify(article),
          link: `/article/${article.id}`,
          youtube_link: article.youtubeLink || "",
          published_date: article.publishedDate || new Date().toISOString(),
          category: article.category || '',
          author_id: article.authorId || ''
        });
        
        results.push({ id: article.id, success: true });
      } catch (error) {
        console.error(`Failed to save article ${article.id}:`, error);
        results.push({ id: article.id, success: false, error: error.message });
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Articles processed', 
        results 
      })
    };
  } catch (error) {
    console.error('Failed to save articles:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save articles: ' + error.message })
    };
  }
};
