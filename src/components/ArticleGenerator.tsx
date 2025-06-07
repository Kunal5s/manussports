
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
        throw new Error(error.message || 'Edge function failed');
      }

      if (data?.success) {
        setGenerationStatus(prev => ({ ...prev, [category]: 'success' }));
        
        toast({
          title: "Success!",
          description: `Generated ${data.count || 6} articles for ${category}`,
        });
        
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
      throw error;
    }
  };

  const generateAllArticles = async () => {
    setIsGenerating(true);
    let successCount = 0;
    
    try {
      toast({
        title: "Starting Generation",
        description: "Generating articles for all categories. This will take a few minutes...",
      });

      for (const category of categories) {
        try {
          console.log(`Generating articles for ${category}...`);
          await generateArticlesForCategory(category);
          successCount++;
          
          // Add delay between categories to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to generate articles for ${category}:`, error);
          // Continue with next category even if one fails
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Generation Complete!",
          description: `Successfully generated articles for ${successCount} categories. Refreshing page...`,
        });
        
        // Sync articles and refresh page
        await syncFromXata(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate articles for any category. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error in generateAllArticles:', error);
      toast({
        title: "Error",
        description: "Failed to complete article generation",
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
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating {currentCategory}...
            </>
          ) : (
            '🚀 Generate All Articles Automatically (6 per Category)'
          )}
        </Button>
        
        {isGenerating && (
          <div className="text-sm text-gray-600 text-center bg-gray-50 p-4 rounded-md">
            <p className="font-medium">⚡ AI is working its magic...</p>
            <p>Current: {currentCategory}</p>
            <p className="text-xs mt-2">This process generates 6 unique articles per category with professional images</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleGenerator;
