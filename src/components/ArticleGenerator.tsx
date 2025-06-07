
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useXataStorage } from '@/hooks/use-xata-storage';

const categories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Athletics', 'Formula 1'];

const ArticleGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [generationStatus, setGenerationStatus] = useState<Record<string, 'idle' | 'generating' | 'success' | 'error'>>({});
  const { toast } = useToast();
  const { syncFromXata } = useXataStorage();

  const generateArticlesForCategory = async (category: string) => {
    try {
      setCurrentCategory(category);
      setGenerationStatus(prev => ({ ...prev, [category]: 'generating' }));
      
      console.log(`Starting generation for ${category}`);
      
      const { data, error } = await supabase.functions.invoke('generate-articles', {
        body: { category }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.success) {
        setGenerationStatus(prev => ({ ...prev, [category]: 'success' }));
        
        toast({
          title: "Success!",
          description: `Generated ${data.articles?.length || 6} articles for ${category}`,
        });

        // Sync articles from database
        await syncFromXata(false);
        
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error generating articles:', error);
      setGenerationStatus(prev => ({ ...prev, [category]: 'error' }));
      
      toast({
        title: "Error",
        description: `Failed to generate articles for ${category}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const generateAllArticles = async () => {
    setIsGenerating(true);
    
    try {
      for (const category of categories) {
        console.log(`Generating articles for ${category}...`);
        await generateArticlesForCategory(category);
        
        // Add delay between categories to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      toast({
        title: "Complete!",
        description: "Generated articles for all categories",
      });
      
      // Final sync and page refresh
      await syncFromXata(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error in generateAllArticles:', error);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-xl font-bold mb-4">AI Article Generator</h3>
      <p className="text-gray-600 mb-4">
        Generate 6 unique articles for each sports category using AI. Each article will have unique topics and professional images.
      </p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((category) => {
            const status = generationStatus[category] || 'idle';
            return (
              <Button
                key={category}
                variant="outline"
                onClick={() => generateArticlesForCategory(category)}
                disabled={isGenerating}
                className="text-sm flex items-center justify-center gap-2"
              >
                {getStatusIcon(status)}
                {category}
              </Button>
            );
          })}
        </div>
        
        <Button
          onClick={generateAllArticles}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating {currentCategory}...
            </>
          ) : (
            'Generate All Articles (Recommended)'
          )}
        </Button>
        
        {isGenerating && (
          <div className="text-sm text-gray-600 text-center">
            <p>This may take a few minutes. Please wait...</p>
            <p>Current: {currentCategory}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleGenerator;
