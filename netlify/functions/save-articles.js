
// Netlify serverless function to save articles to Xata
const { getXataClient } = require('./xata-client');

exports.handler = async (event) => {
  try {
    const xata = getXataClient();
    const { articles } = JSON.parse(event.body);
    
    if (!articles || !Array.isArray(articles)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid articles data' })
      };
    }
    
    // Save each article to Xata
    for (const article of articles) {
      await xata.db.articles.createOrReplace({
        id: article.id,
        title: article.title,
        feature_image: article.featuredImage,
        content: JSON.stringify(article),
        link: `/article/${article.id}`,
        youtube_link: ""
      });
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Articles saved successfully' })
    };
  } catch (error) {
    console.error('Failed to save articles:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save articles' })
    };
  }
};
