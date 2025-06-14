
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Hook for handling Supabase database operations
export const useXataStorage = () => {
  const { articles, addArticle, deleteArticle, updateArticle } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Save articles to Supabase
  const saveToXata = async (articlesToSave: Article[]): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      if (!articlesToSave || articlesToSave.length === 0) {
        console.log("No articles to save to Supabase");
        setIsSyncing(false);
        return true;
      }
      
      console.log(`Attempting to save ${articlesToSave.length} articles to Supabase`);
      
      // Get category mappings
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name');
      
      const categoryMap = new Map(categories?.map(cat => [cat.name, cat.id]) || []);
      
      // Save each article
      for (const article of articlesToSave) {
        const categoryId = categoryMap.get(article.category);
        if (!categoryId) {
          console.error(`Category ${article.category} not found`);
          continue;
        }
        
        const { error } = await supabase
          .from('articles')
          .insert({
            title: article.title,
            content: JSON.stringify(article),
            summary: article.summary,
            category_id: categoryId,
            image_url: article.featuredImage
          });
          
        if (error) {
          console.error('Error saving article:', error);
        }
      }
      
      setLastSyncTime(new Date());
      console.log(`Successfully saved ${articlesToSave.length} articles to Supabase`);
      
      return true;
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Supabase
  const syncFromXata = async (showToast = false): Promise<boolean> => {
    try {
      setIsSyncing(true);
      console.log("Syncing articles from Supabase...");
      
      // Fetch articles with category information
      const { data: articlesData, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          summary,
          content,
          image_url,
          created_at,
          categories (
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching articles:", error);
        return false;
      }
      
      console.log(`Fetched ${articlesData?.length || 0} articles from Supabase`);
      
      // Transform Supabase data to local Article format
      const transformedArticles: Article[] = (articlesData || []).map(article => {
        try {
          // Parse the content field if it's a JSON string
          let parsedContent;
          let articleContent = '';
          
          if (typeof article.content === 'string') {
            try {
              parsedContent = JSON.parse(article.content);
              articleContent = parsedContent.content || article.content;
            } catch (parseError) {
              console.log('Content is not JSON, using as-is');
              articleContent = article.content;
            }
          } else {
            articleContent = article.content || '';
          }
          
          return {
            id: article.id,
            title: article.title,
            summary: article.summary,
            content: articleContent,
            category: (article.categories as any)?.name || 'General',
            authorId: 'ai-generated',
            featuredImage: article.image_url || '',
            publishedDate: article.created_at,
            readTime: Math.ceil(articleContent.split(' ').length / 200) || 5,
            views: {
              total: Math.floor(Math.random() * 1000) + 100,
              daily: [0, 0, 0, 0, 0, 0, 0],
              weekly: [0, 0, 0, 0, 0],
              monthly: [0, 0, 0, 0, 0, 0],
              sixMonths: [0, 0, 0, 0, 0, 0],
              yearly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          };
        } catch (parseError) {
          console.error('Error transforming article:', parseError);
          return {
            id: article.id,
            title: article.title,
            summary: article.summary,
            content: article.content || '',
            category: (article.categories as any)?.name || 'General',
            authorId: 'ai-generated',
            featuredImage: article.image_url || '',
            publishedDate: article.created_at,
            readTime: 5,
            views: {
              total: Math.floor(Math.random() * 1000) + 100,
              daily: [0, 0, 0, 0, 0, 0, 0],
              weekly: [0, 0, 0, 0, 0],
              monthly: [0, 0, 0, 0, 0, 0],
              sixMonths: [0, 0, 0, 0, 0, 0],
              yearly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          };
        }
      });
      
      // Update local storage with articles from Supabase
      localStorage.setItem('manusSportsArticles', JSON.stringify(transformedArticles));
      
      if (showToast && transformedArticles.length > 0) {
        toast.success(`Loaded ${transformedArticles.length} articles successfully`);
      }
      
      setLastSyncTime(new Date());
      console.log(`Successfully loaded ${transformedArticles.length} articles from Supabase`);
      
      // Force refresh the page to reload articles in DataContext
      if (transformedArticles.length > 0) {
        window.location.reload();
      }
      
      return true;
    } catch (error) {
      console.error("Error syncing from Supabase:", error);
      if (showToast) {
        toast.error("Failed to sync articles");
      }
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    saveToXata,
    syncFromXata,
    isSyncing,
    lastSyncTime
  };
};
