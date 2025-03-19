
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
      
      console.log(`Attempting to save ${articlesToSave.length} articles to Xata`);
      
      // Use Netlify's serverless function to save articles
      const response = await fetch('/.netlify/functions/save-articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articles: articlesToSave }),
      });
      
      // Log the response status
      console.log(`Save articles response status: ${response.status}`);
      
      // Check if the response is OK before attempting to parse JSON
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response';
        }
        
        console.error(`Failed to save articles: ${response.status}`, errorText);
        
        toast({
          title: "Error saving articles",
          description: `Server returned ${response.status}. Please try again later.`,
          variant: "destructive",
        });
        
        return false;
      }
      
      let data;
      try {
        data = await response.json();
        console.log("Save articles response data:", data);
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        toast({
          title: "Error saving articles",
          description: "Received invalid response from server. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      setLastSyncTime(new Date());
      console.log(`Successfully saved ${articlesToSave.length} articles to Xata`);
      
      toast({
        title: "Articles saved",
        description: `${articlesToSave.length} articles saved to database`,
      });
      
      return true;
    } catch (error) {
      console.error("Error saving to Xata:", error);
      
      toast({
        title: "Error saving articles",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Xata with improved error handling
  const syncFromXata = async (): Promise<boolean> => {
    try {
      setIsSyncing(true);
      console.log("Attempting to sync articles from Xata");
      
      // Add cache-busting parameter to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/.netlify/functions/get-articles?t=${timestamp}`);
      
      // Log the response status
      console.log(`Sync articles response status: ${response.status}`);
      
      // Check if the response is OK first before trying to parse JSON
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Failed to read error response';
        }
        
        console.error(`Failed to fetch articles: ${response.status}`, errorText);
        
        toast({
          title: "Error loading articles",
          description: `Server returned ${response.status}. Please try again later.`,
          variant: "destructive",
        });
        
        return false;
      }
      
      // First get the response as text
      let responseText;
      try {
        responseText = await response.text();
        console.log("Received text response of length:", responseText.length);
      } catch (error) {
        console.error("Error getting response text:", error);
        toast({
          title: "Error loading articles",
          description: "Failed to read server response",
          variant: "destructive",
        });
        return false;
      }
      
      // Verify that the response is valid JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Sync articles response data:", data);
      } catch (error) {
        console.error("Invalid JSON response from API:", error);
        console.error("Response text:", responseText.substring(0, 200)); // Log first 200 chars
        
        toast({
          title: "Error loading articles",
          description: "Server returned invalid data format",
          variant: "destructive",
        });
        
        return false;
      }
      
      if (!data.articles) {
        console.error("Invalid response format from get-articles:", data);
        
        toast({
          title: "Error loading articles",
          description: "Received invalid data format from server",
          variant: "destructive",
        });
        
        return false;
      }
      
      if (data.articles.length === 0) {
        console.log("No articles found in database");
        
        toast({
          title: "No articles found",
          description: "The database has no articles stored",
        });
        
        return true; // Not an error, just no articles
      }
      
      // Update local storage with articles from Xata
      localStorage.setItem('manusSportsArticles', JSON.stringify(data.articles));
      
      setLastSyncTime(new Date());
      console.log(`${data.articles.length} articles loaded from database.`);
      
      toast({
        title: "Articles loaded",
        description: `${data.articles.length} articles loaded from database`,
      });
      
      // Refresh the page to update articles
      window.location.reload();
      return true;
    } catch (error) {
      console.error("Error syncing from Xata:", error);
      
      toast({
        title: "Error loading articles",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
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
