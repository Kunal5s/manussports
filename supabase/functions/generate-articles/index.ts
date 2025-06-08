
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

    console.log(`⚡ Fast generation starting for: ${category}`);
    const startTime = Date.now();

    // Get category UUID
    const { data: categoryData, error: categoryError } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('name', category)
      .single();

    if (categoryError || !categoryData) {
      throw new Error(`Category "${category}" not found`);
    }

    const categoryId = categoryData.id;
    console.log(`📂 Category ID found: ${categoryId}`);

    // Clear existing articles for this category
    await supabaseClient
      .from('articles')
      .delete()
      .eq('category_id', categoryId);

    // Generate 6 unique topics with optimized prompt for speed
    const topicsPrompt = `Generate 6 unique trending ${category} article titles. Each MUST be exactly 12 words. Make them exciting and clickable. Format as numbered list 1-6:`;

    const topicsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: topicsPrompt }]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.8
        }
      })
    });

    const topicsData = await topicsResponse.json();
    const topicsText = topicsData.candidates[0].content.parts[0].text;
    const topics = topicsText.split('\n')
      .filter((topic: string) => topic.trim())
      .map((topic: string) => topic.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 6);

    console.log(`📝 Generated ${topics.length} topics in ${Date.now() - startTime}ms`);

    // Fetch images in parallel for speed
    const imagePromises = topics.map(async (topic, index) => {
      const imageQuery = `${category} sports action professional`;
      const pexelsResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imageQuery)}&per_page=10&orientation=landscape`, {
        headers: { 'Authorization': pexelsApiKey }
      });
      const pexelsData = await pexelsResponse.json();
      const randomIndex = Math.floor(Math.random() * Math.min(pexelsData.photos.length, 10));
      return pexelsData.photos[randomIndex]?.src?.large || '';
    });

    const images = await Promise.all(imagePromises);
    console.log(`🖼️ Fetched images in ${Date.now() - startTime}ms`);

    // Generate articles in parallel for maximum speed
    const articlePromises = topics.map(async (topic, index) => {
      const articlePrompt = `Write a 1500-word professional ${category} article about: "${topic}".

Structure with HTML:
<h1>${topic}</h1>
<p>Engaging intro...</p>
<h2>Current Analysis</h2>
<p>Content...</p>
<h2>Impact on ${category}</h2>
<p>Content...</p>
<h2>Expert Insights</h2>
<p>Content with quotes...</p>
<h2>Future Outlook</h2>
<p>Content...</p>
<h2>Conclusion</h2>
<p>Final thoughts...</p>

Make it professional, engaging, and trending.`;

      const articleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: articlePrompt }]
          }],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        })
      });

      const articleData = await articleResponse.json();
      const content = articleData.candidates[0].content.parts[0].text;

      // Create article data
      const articleId = `${category.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`;
      const htmlContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const summary = htmlContent.length > 150 ? htmlContent.substring(0, 150) + '...' : htmlContent;
      const wordCount = htmlContent.split(' ').filter(word => word.length > 0).length;
      const readTime = Math.ceil(wordCount / 250);

      const articleToSave = {
        id: articleId,
        title: topic,
        content: content,
        summary: summary,
        category: category,
        featuredImage: images[index] || '',
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

      // Save to database
      const { error } = await supabaseClient
        .from('articles')
        .insert({
          title: articleToSave.title,
          content: JSON.stringify(articleToSave),
          summary: articleToSave.summary,
          category_id: categoryId,
          image_url: articleToSave.featuredImage,
          is_trending: index < 2
        });

      if (error) {
        console.error('❌ Error saving article:', error);
        throw error;
      }

      return articleToSave;
    });

    // Wait for all articles to be generated and saved
    const articles = await Promise.all(articlePromises);
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Generated ${articles.length} articles for ${category} in ${totalTime}ms`);

    return new Response(JSON.stringify({ 
      success: true,
      articles: articles,
      count: articles.length,
      generationTime: totalTime,
      message: `⚡ Fast generated ${articles.length} trending ${category} articles in ${Math.round(totalTime/1000)}s`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error generating articles:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
