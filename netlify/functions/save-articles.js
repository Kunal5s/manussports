
// Netlify serverless function to save articles to Xata
const { getXataClient } = require('./xata-client');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  
  console.log("Starting save-articles function");
  
  try {
    const xata = getXataClient();
    console.log("Xata client retrieved successfully");
    
    let articles;
    
    try {
      articles = JSON.parse(event.body).articles;
      console.log(`Received ${articles ? articles.length : 0} articles to save`);
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      console.error("Request body:", event.body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }
    
    if (!articles || !Array.isArray(articles)) {
      console.error("Invalid articles data:", articles);
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
        
        console.log(`Saving article with ID: ${article.id}`);
        
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
        
        console.log(`Successfully saved article with ID: ${article.id}`);
        results.push({ id: article.id, success: true });
      } catch (error) {
        console.error(`Failed to save article ${article.id}:`, error);
        results.push({ id: article.id, success: false, error: error.message });
      }
    }
    
    console.log(`Processed ${results.length} articles with results`);
    
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
