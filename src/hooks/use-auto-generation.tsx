
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAutoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const categories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Athletics', 'Formula 1'];
  
  const shouldGenerateToday = () => {
    const lastGenerated = localStorage.getItem('lastArticleGeneration');
    const today = new Date().toDateString();
    return lastGenerated !== today;
  };
  
  const generateArticlesForCategory = async (category: string) => {
    try {
      console.log(`Generating articles for ${category}...`);
      
      const { data, error } = await supabase.functions.invoke('generate-articles', {
        body: { category }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Edge function failed');
      }

      if (data?.success) {
        console.log(`Generated ${data.count || 6} articles for ${category}`);
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error(`Error generating articles for ${category}:`, error);
      throw error;
    }
  };
  
  const generateAllArticles = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    let successCount = 0;
    
    try {
      console.log("Starting automatic article generation...");
      
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        try {
          await generateArticlesForCategory(category);
          successCount++;
          setGenerationProgress((i + 1) / categories.length * 100);
          
          // Add delay between categories to avoid rate limiting
          if (i < categories.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`Failed to generate articles for ${category}:`, error);
        }
      }
      
      if (successCount > 0) {
        localStorage.setItem('lastArticleGeneration', new Date().toDateString());
        toast.success(`Successfully generated articles for ${successCount} categories!`);
        
        // Refresh page after generation
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Failed to generate any articles");
      }
      
    } catch (error) {
      console.error('Error in generateAllArticles:', error);
      toast.error("Failed to complete article generation");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };
  
  return {
    isGenerating,
    generationProgress,
    shouldGenerateToday,
    generateAllArticles,
    generateArticlesForCategory
  };
};
