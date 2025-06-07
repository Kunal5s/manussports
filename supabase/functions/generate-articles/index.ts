
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

    console.log(`Starting article generation for category: ${category}`);

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

    // Generate 6 unique topics for the category
    const topicsPrompt = `Generate 6 unique, engaging, and current sports topics specifically about ${category}. Each topic should be exactly 8-12 words and focus on recent trends, player performances, team strategies, or current events in ${category}. Make them clickable and interesting for sports fans. Topics should be different from each other and avoid repetition. Format as a simple numbered list.`;

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
      console.log(`Generating article ${i + 1} for topic: ${topic}`);
      
      // Generate article content
      const articlePrompt = `Write a comprehensive 1500-2000 word sports article about: "${topic}". 

      Structure the article with:
      - Engaging introduction paragraph (2-3 sentences)
      - 4-5 main sections with descriptive H2 headings
      - Use H3 subheadings within sections where appropriate
      - Short paragraphs (2-3 sentences each)
      - Include current analysis and insights
      - Add relevant statistics or data points where possible
      - Conclude with future outlook

      Format in clean HTML with proper heading tags (h2, h3, p). Make it engaging and informative for ${category} enthusiasts. Ensure the content is unique, current, and well-structured.`;

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

      // Fetch relevant image from Pexels
      const imageQuery = `${category} sports ${topic.split(' ').slice(0, 3).join(' ')}`;
      console.log(`Fetching image for query: ${imageQuery}`);
      
      const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imageQuery)}&per_page=1&orientation=landscape`, {
        headers: { 'Authorization': pexelsApiKey }
      });

      const pexelsData = await pexelsResponse.json();
      const featuredImage = pexelsData.photos[0]?.src?.large || '';

      // Create unique article ID
      const articleId = `${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`;

      // Extract summary from content (clean HTML and take first 150 chars)
      const htmlContent = content.replace(/<[^>]*>/g, '');
      const summary = htmlContent.length > 150 ? htmlContent.substring(0, 150) + '...' : htmlContent;

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
        readTime: Math.ceil(content.split(' ').length / 200),
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
          image_url: articleToSave.featuredImage
        });

      if (error) {
        console.error('Error saving article:', error);
      } else {
        console.log(`Successfully saved article: ${articleToSave.title}`);
        articles.push(articleToSave);
      }

      // Add small delay between articles
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Successfully generated ${articles.length} articles for ${category}`);

    return new Response(JSON.stringify({ 
      success: true,
      articles: articles,
      count: articles.length,
      message: `Generated ${articles.length} articles for ${category}`
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
