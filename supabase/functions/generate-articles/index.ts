
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { category } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const pexelsApiKey = Deno.env.get('PEXELS_API_KEY');

    if (!geminiApiKey || !pexelsApiKey) {
      throw new Error('Missing API keys');
    }

    console.log(`Starting automatic article generation for category: ${category}`);

    // Get the category UUID from the database
    const { data: categoryData, error: categoryError } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (categoryError || !categoryData) {
      console.error('Category not found:', category, categoryError);
      throw new Error(`Category "${category}" not found in database`);
    }

    const categoryId = categoryData.id;
    console.log(`Found category ID: ${categoryId} for category: ${category}`);

    // Delete existing articles for this category first
    await supabaseClient
      .from('articles')
      .delete()
      .eq('category_id', categoryId);

    // Generate 6 unique trending topics for the category
    const topicsPrompt = `Generate 6 unique, trending, and highly engaging sports article titles specifically about ${category}. Each title must be EXACTLY 12 words long - no more, no less. Focus on current events, breaking news, player performances, team strategies, recent matches, transfers, or controversies in ${category}. Make them clickable and exciting for sports fans. Topics should be completely different from each other and reflect the latest developments in ${category}. Format as a simple numbered list.

Examples for reference:
1. Manchester United's New Signing Strategy Could Transform Their Championship Hopes This Season
2. Tennis Grand Slam Tournament Format Changes Sparking Heated Debates Among Professional Players  
3. NBA Draft Lottery Results Reshape Team Strategies for Upcoming Free Agency Period

Now generate 6 unique ${category} topics following this exact 12-word format:`;

    const topicsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: topicsPrompt }]
        }]
      })
    });

    const topicsData = await topicsResponse.json();
    const topicsText = topicsData.candidates[0].content.parts[0].text;
    const topics = topicsText.split('\n')
      .filter((topic: string) => topic.trim())
      .map((topic: string) => topic.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 6);

    console.log(`Generated ${topics.length} topics for ${category}:`, topics);

    const articles = [];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      console.log(`Generating article ${i + 1}/6 for topic: ${topic}`);
      
      // Generate comprehensive 2000-word article content
      const articlePrompt = `Write a comprehensive 2000-word professional sports article about: "${topic}". 

      REQUIREMENTS:
      - Target exactly 2000 words
      - Use proper HTML structure with H1, H2, H3, H4, H5, H6 headings
      - Start with an engaging H1 title
      - Create 6-8 main sections with H2 headings
      - Use H3, H4, H5, H6 for subsections where appropriate
      - Write in professional sports journalism style
      - Include current analysis, statistics, and expert insights
      - Make paragraphs 2-3 sentences each for readability
      - Add realistic quotes from experts or players
      - Include future outlook and predictions
      - Use trending keywords related to ${category}

      STRUCTURE EXAMPLE:
      <h1>Main Title About ${topic}</h1>
      <p>Engaging introduction paragraph...</p>
      
      <h2>Current Situation Analysis</h2>
      <p>Content...</p>
      <h3>Key Performance Metrics</h3>
      <p>Content...</p>
      
      <h2>Impact on ${category}</h2>
      <p>Content...</p>
      <h3>Short-term Effects</h3>
      <h4>Player Performance Changes</h4>
      <p>Content...</p>
      
      <h2>Expert Analysis</h2>
      <p>Content with quotes...</p>
      
      <h2>Statistical Breakdown</h2>
      <p>Content...</p>
      
      <h2>Future Predictions</h2>
      <p>Content...</p>
      <h3>Season Outlook</h3>
      <p>Content...</p>
      
      <h2>Conclusion</h2>
      <p>Final thoughts...</p>

      Make it engaging, informative, and trending for ${category} enthusiasts.`;

      const articleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: articlePrompt }]
          }]
        })
      });

      const articleData = await articleResponse.json();
      const content = articleData.candidates[0].content.parts[0].text;

      // Fetch high-quality professional sports image from Pexels
      const imageQuery = `${category} sports professional action player`;
      console.log(`Fetching professional image for query: ${imageQuery}`);
      
      const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imageQuery)}&per_page=15&orientation=landscape&size=large`, {
        headers: { 'Authorization': pexelsApiKey }
      });

      const pexelsData = await pexelsResponse.json();
      const randomIndex = Math.floor(Math.random() * Math.min(pexelsData.photos.length, 15));
      const featuredImage = pexelsData.photos[randomIndex]?.src?.large || '';

      // Create unique article ID
      const articleId = `${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`;

      // Extract summary from content (clean HTML and take first 150 chars)
      const htmlContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const summary = htmlContent.length > 150 ? htmlContent.substring(0, 150) + '...' : htmlContent;

      // Calculate actual word count for accurate read time
      const wordCount = htmlContent.split(' ').filter(word => word.length > 0).length;
      const readTime = Math.ceil(wordCount / 250); // 250 words per minute reading speed

      // Save to Supabase with proper structure
      console.log(`Saving article to database: ${topic}`);
      
      const articleToSave = {
        id: articleId,
        title: topic,
        content: content,
        summary: summary,
        category: category,
        featuredImage: featuredImage,
        authorId: 'ai-generated',
        publishedDate: new Date().toISOString(),
        readTime: readTime,
        views: { 
          total: Math.floor(Math.random() * 500) + 100,
          daily: [0, 0, 0, 0, 0, 0, 0],
          weekly: [0, 0, 0, 0, 0],
          monthly: [0, 0, 0, 0, 0, 0],
          sixMonths: [0, 0, 0, 0, 0, 0],
          yearly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      };

      const { error } = await supabaseClient
        .from('articles')
        .insert({
          title: articleToSave.title,
          content: JSON.stringify(articleToSave),
          summary: articleToSave.summary,
          category_id: categoryId,
          image_url: articleToSave.featuredImage,
          is_trending: i < 2 // Mark first 2 articles as trending
        });

      if (error) {
        console.error('Error saving article:', error);
      } else {
        console.log(`Successfully saved article: ${articleToSave.title}`);
        articles.push(articleToSave);
      }

      // Add delay between articles to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Successfully generated ${articles.length} articles for ${category}`);

    return new Response(JSON.stringify({ 
      success: true,
      articles: articles,
      count: articles.length,
      message: `Automatically generated ${articles.length} trending articles for ${category} with professional images`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating articles:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
