
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const categories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Athletics', 'Formula 1'];

const ArticleGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const { toast } = useToast();

  const generateArticlesForCategory = async (category: string) => {
    try {
      setCurrentCategory(category);
      const { data, error } = await supabase.functions.invoke('generate-articles', {
        body: { category }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated 6 articles for ${category}`,
      });

      return data;
    } catch (error) {
      console.error('Error generating articles:', error);
      toast({
        title: "Error",
        description: `Failed to generate articles for ${category}`,
        variant: "destructive",
      });
    }
  };

  const generateAllArticles = async () => {
    setIsGenerating(true);
    
    try {
      for (const category of categories) {
        await generateArticlesForCategory(category);
        // Add a small delay between categories to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      toast({
        title: "Complete!",
        description: "Generated articles for all categories",
      });
      
      // Refresh the page to show new articles
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate all articles",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setCurrentCategory('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-xl font-bold mb-4">AI Article Generator</h3>
      <p className="text-gray-600 mb-4">
        Generate 6 unique articles for each sports category using AI
      </p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              onClick={() => generateArticlesForCategory(category)}
              disabled={isGenerating}
              className="text-sm"
            >
              {currentCategory === category && isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {category}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={generateAllArticles}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating {currentCategory}...
            </>
          ) : (
            'Generate All Articles'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ArticleGenerator;
