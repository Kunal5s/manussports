
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

// Hook for handling Xata database operations via Netlify functions
export const useXataStorage = () => {
  const { articles, addArticle, deleteArticle, updateArticle } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Save articles to Xata with improved error handling
  const saveToXata = async (articlesToSave: Article[]): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      if (!articlesToSave || articlesToSave.length === 0) {
        console.log("No articles to save to Xata");
        setIsSyncing(false);
        return true;
      }
      
      // Use Netlify's serverless function to save articles
      const response = await fetch('/.netlify/functions/save-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articles: articlesToSave }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Failed to save articles: ${response.status}`, data);
        return false;
      }
      
      setLastSyncTime(new Date());
      console.log(`Successfully saved ${articlesToSave.length} articles to Xata`);
      return true;
    } catch (error) {
      console.error("Error saving to Xata:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Xata with improved error handling
  const syncFromXata = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      // Use Netlify's serverless function to fetch articles
      const response = await fetch('/.netlify/functions/get-articles');
      
      if (!response.ok) {
        console.error(`Failed to fetch articles: ${response.status}`);
        return false;
      }
      
      const responseText = await response.text();
      
      // Check if the response is valid JSON
      try {
        const data = JSON.parse(responseText);
        
        if (!data.articles) {
          console.error("Invalid response format from get-articles:", data);
          return false;
        }
        
        if (data.articles.length === 0) {
          console.log("No articles found in database");
          return true; // Not an error, just no articles
        }
        
        // Update local storage with articles from Xata
        localStorage.setItem('manusSportsArticles', JSON.stringify(data.articles));
        
        setLastSyncTime(new Date());
        console.log(`${data.articles.length} articles loaded from database.`);
        
        // Refresh the page to update articles
        window.location.reload();
        return true;
      } catch (error) {
        console.error("Invalid JSON response from API:", error);
        console.error("Response text:", responseText.substring(0, 200)); // Log first 200 chars
        return false;
      }
    } catch (error) {
      console.error("Error syncing from Xata:", error);
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
