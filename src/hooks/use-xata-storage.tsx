
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

// Hook for handling Xata database operations via Netlify functions
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
        console.error(`Failed to save articles: ${response.status}`);
        return; // Silently fail without showing error toast
      }
      
      console.log("Articles successfully saved to Xata");
    } catch (error) {
      console.error("Error saving to Xata:", error);
      // Silently handle the error without showing a popup
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Xata without showing error popups
  const syncFromXata = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      
      // Use Netlify's serverless function to fetch articles
      const response = await fetch('/.netlify/functions/get-articles');
      
      if (!response.ok) {
        console.log("Could not connect to database, using local articles");
        return;
      }
      
      const data = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        console.log("No articles found in database");
        return;
      }
      
      // Update local storage with articles from Xata
      localStorage.setItem('manusSportsArticles', JSON.stringify(data.articles));
      
      // Only show success toast, never error toast
      console.log(`${data.articles.length} articles loaded from database.`);
      
      // Refresh the page to update articles
      window.location.reload();
    } catch (error) {
      console.error("Error syncing from Xata:", error);
      // Silently handle the error without showing a popup
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
