
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

    // First, get the category UUID from the database
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

    // Generate 6 unique topics for the category
    const topicsPrompt = `Generate 6 unique, trending, and engaging sports topics related to ${category}. Each topic should be exactly 12 words. Topics should be current, interesting, and avoid duplicates. Format as a simple list, one topic per line.`;

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
    const topics = topicsText.split('\n').filter((topic: string) => topic.trim()).slice(0, 6);

    const articles = [];

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i].replace(/^\d+\.\s*/, '').trim();
      
      // Generate article content
      const articlePrompt = `Write a comprehensive 2000-word sports article about: "${topic}". 

      Structure the article with:
      - Engaging introduction
      - Multiple sections with H2, H3, H4, H5, H6 subheadings
      - Short paragraphs (2-3 sentences each)
      - Current trends and analysis
      - Expert insights
      - Conclusion

      Format in HTML with proper heading tags. Make it engaging and informative for sports enthusiasts.`;

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

      // Fetch image from Pexels
      const imageQuery = `${category} ${topic.split(' ').slice(0, 3).join(' ')}`;
      const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imageQuery)}&per_page=1&orientation=landscape`, {
        headers: { 'Authorization': pexelsApiKey }
      });

      const pexelsData = await pexelsResponse.json();
      const featuredImage = pexelsData.photos[0]?.src?.large || '';

      // Generate summary from first paragraph
      const tempDiv = content.match(/<p>(.*?)<\/p>/)?.[1] || topic;
      const summary = tempDiv.length > 200 ? tempDiv.substring(0, 200) + '...' : tempDiv;

      const article = {
        id: `${category.toLowerCase()}-${Date.now()}-${i}`,
        title: topic,
        content: content,
        summary: summary,
        category: category,
        featuredImage: featuredImage,
        authorId: 'ai-generated',
        publishedDate: new Date().toISOString(),
        readTime: Math.ceil(content.split(' ').length / 200),
        views: { total: Math.floor(Math.random() * 1000) + 100 }
      };

      // Save to Supabase with proper category_id
      const { error } = await supabaseClient
        .from('articles')
        .insert({
          title: article.title,
          content: JSON.stringify(article),
          summary: article.summary,
          category_id: categoryId, // Use the actual UUID from categories table
          image_url: article.featuredImage
        });

      if (error) {
        console.error('Error saving article:', error);
      } else {
        console.log(`Successfully saved article: ${article.title}`);
      }

      articles.push(article);
    }

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating articles:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
