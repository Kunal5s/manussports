
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

// Using Netlify environment variables for Xata connection
export const useXataStorage = () => {
  const { articles, addArticle, deleteArticle, updateArticle } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Save articles to Xata
  const saveToXata = async (articlesToSave: Article[]): Promise<void> => {
    try {
      setIsSyncing(true);
      
      // Use Netlify's serverless function to save articles
      const response = await fetch('/.netlify/functions/save-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articles: articlesToSave }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save articles: ${response.status}`);
      }
      
      toast({
        title: "Backup successful",
        description: "All articles have been backed up to database.",
      });
    } catch (error) {
      console.error("Error saving to Xata:", error);
      toast({
        title: "Backup failed",
        description: "Articles saved to local storage only. You can try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Xata
  const syncFromXata = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      
      // Use Netlify's serverless function to fetch articles
      const response = await fetch('/.netlify/functions/get-articles');
      
      if (!response.ok) {
        throw new Error(`Failed to sync from Xata: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        console.log("No articles found in Xata");
        toast({
          title: "No articles found",
          description: "No articles found in the database. Start by creating some!",
        });
        return;
      }
      
      // Update local storage with articles from Xata
      localStorage.removeItem('manusSportsArticles');
      localStorage.setItem('manusSportsArticles', JSON.stringify(data.articles));
      
      toast({
        title: "Sync successful",
        description: `${data.articles.length} articles loaded from database.`,
      });
      
      // Force a page reload to refresh the DataContext with new articles
      window.location.reload();
    } catch (error) {
      console.error("Error syncing from Xata:", error);
      toast({
        title: "Sync failed",
        description: "Using local articles only. Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    saveToXata,
    syncFromXata,
    isSyncing
  };
};
