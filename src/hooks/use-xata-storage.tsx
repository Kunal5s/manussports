
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';

// Hook for handling Xata database operations via Netlify functions
export const useXataStorage = () => {
  const { articles, addArticle, deleteArticle, updateArticle } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Helper function to check if response is HTML (error page)
  const isHtmlResponse = (text: string): boolean => {
    return text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
  };

  // Save articles to Xata with improved error handling
  const saveToXata = async (articlesToSave: Article[]): Promise<boolean> => {
    try {
      setIsSyncing(true);
      
      if (!articlesToSave || articlesToSave.length === 0) {
        console.log("No articles to save to Xata");
        setIsSyncing(false);
        return true;
      }
      
      console.log(`Attempting to save ${articlesToSave.length} articles to Xata`);
      
      // Use Netlify's serverless function to save articles
      const response = await fetch('/.netlify/functions/save-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ articles: articlesToSave }),
      });
      
      // Log the response status
      console.log(`Save articles response status: ${response.status}`);
      
      const responseText = await response.text();
      
      // Check if the response is HTML (error page)
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML error page instead of JSON");
        
        // Store articles in localStorage as fallback
        localStorage.setItem('manusSportsArticles', JSON.stringify(articlesToSave));
        console.log("Saved articles to localStorage as fallback");
        
        return false;
      }
      
      try {
        const data = JSON.parse(responseText);
        console.log("Save articles response data:", data);
        
        // Update localStorage with the articles we just saved
        localStorage.setItem('manusSportsArticles', JSON.stringify(articlesToSave));
        
        setLastSyncTime(new Date());
        console.log(`Successfully saved ${articlesToSave.length} articles to Xata`);
        
        return true;
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
        
        // Store articles in localStorage as fallback
        localStorage.setItem('manusSportsArticles', JSON.stringify(articlesToSave));
        console.log("Saved articles to localStorage as fallback");
        
        return false;
      }
    } catch (error) {
      console.error("Error saving to Xata:", error);
      
      // Store articles in localStorage as fallback
      localStorage.setItem('manusSportsArticles', JSON.stringify(articlesToSave));
      console.log("Saved articles to localStorage as fallback");
      
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Xata with improved error handling
  const syncFromXata = async (showToast = false): Promise<boolean> => {
    try {
      setIsSyncing(true);
      console.log("Attempting to sync articles from Xata");
      
      // Add cache-busting parameter to prevent browser caching
      const timestamp = new Date().getTime();
      
      // Make the request to the Netlify function with cache control headers
      const response = await fetch(`/.netlify/functions/get-articles?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // Log the response status
      console.log(`Sync articles response status: ${response.status}`);
      
      // Get the response as text first to check its format
      const responseText = await response.text();
      console.log("Response text length:", responseText.length);
      
      // Check if it's HTML (error page)
      if (isHtmlResponse(responseText)) {
        console.error("Received HTML error page instead of JSON");
        
        // Get articles from localStorage as fallback
        const storedArticles = localStorage.getItem('manusSportsArticles');
        if (storedArticles) {
          console.log("Using articles from localStorage as fallback");
          return true;
        } else {
          console.log("No articles in localStorage, storing empty array");
          localStorage.setItem('manusSportsArticles', JSON.stringify([]));
          return false;
        }
      }
      
      // Check if it's valid JSON
      try {
        const data = JSON.parse(responseText);
        
        if (!data.articles) {
          console.error("Invalid response format from get-articles:", data);
          
          // Get articles from localStorage as fallback
          const storedArticles = localStorage.getItem('manusSportsArticles');
          if (storedArticles) {
            console.log("Using articles from localStorage as fallback");
            return true;
          } else {
            console.log("No articles in localStorage, storing empty array");
            localStorage.setItem('manusSportsArticles', JSON.stringify([]));
            return false;
          }
        }
        
        // Update local storage with articles from Xata
        localStorage.setItem('manusSportsArticles', JSON.stringify(data.articles));
        
        if (showToast) {
          toast.success("Articles synced successfully");
        }
        
        setLastSyncTime(new Date());
        console.log(`${data.articles.length} articles loaded from database.`);
        
        return true;
      } catch (error) {
        console.error("Invalid JSON response from API:", error);
        
        // Get articles from localStorage as fallback
        const storedArticles = localStorage.getItem('manusSportsArticles');
        if (storedArticles) {
          console.log("Using articles from localStorage as fallback");
          return true;
        } else {
          console.log("No articles in localStorage, storing empty array");
          localStorage.setItem('manusSportsArticles', JSON.stringify([]));
          return false;
        }
      }
    } catch (error) {
      console.error("Error syncing from Xata:", error);
      
      // Get articles from localStorage as fallback
      const storedArticles = localStorage.getItem('manusSportsArticles');
      if (storedArticles) {
        console.log("Using articles from localStorage as fallback");
        return true;
      } else {
        console.log("No articles in localStorage, storing empty array");
        localStorage.setItem('manusSportsArticles', JSON.stringify([]));
        return false;
      }
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
