
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

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
        console.log(`Failed to save articles: ${response.status}`);
        return false;
      }
      
      let data;
      try {
        data = await response.json();
        console.log("Save articles response data:", data);
      } catch (error) {
        console.log("Error parsing JSON response:", error);
        return false;
      }
      
      setLastSyncTime(new Date());
      console.log(`Successfully saved ${articlesToSave.length} articles to Xata`);
      
      return true;
    } catch (error) {
      console.log("Error saving to Xata:", error);
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
      
      // First get the response as text to see what we're getting
      const responseText = await response.text();
      console.log("Response text length:", responseText.length);
      
      // Check if it's HTML instead of JSON (common error with Netlify dev)
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html>')) {
        console.log("Received HTML instead of JSON. Using local articles if available.");
        
        // Try to use local articles instead of showing an error
        const localArticles = localStorage.getItem('manusSportsArticles');
        if (localArticles) {
          console.log("Using articles from local storage");
          return true;
        }
        
        // If no local articles, store empty array to prevent future errors
        localStorage.setItem('manusSportsArticles', JSON.stringify([]));
        return true;
      }
      
      // Try to parse the JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed data successfully:", data);
      } catch (error) {
        console.log("Invalid JSON response from API:", error);
        
        // Try to use local articles instead of showing an error
        const localArticles = localStorage.getItem('manusSportsArticles');
        if (localArticles) {
          console.log("Using articles from local storage");
          return true;
        }
        
        // If no local articles, store empty array to prevent future errors
        localStorage.setItem('manusSportsArticles', JSON.stringify([]));
        return true;
      }
      
      if (!data.articles) {
        console.log("Invalid response format from get-articles:", data);
        
        // Try to use local articles instead
        const localArticles = localStorage.getItem('manusSportsArticles');
        if (localArticles) {
          console.log("Using articles from local storage");
          return true;
        }
        
        // If no local articles, store empty array
        localStorage.setItem('manusSportsArticles', JSON.stringify([]));
        return true;
      }
      
      // Update local storage with articles from Xata
      localStorage.setItem('manusSportsArticles', JSON.stringify(data.articles));
      
      setLastSyncTime(new Date());
      console.log(`${data.articles.length} articles loaded from database.`);
      
      return true;
    } catch (error) {
      console.log("Error syncing from Xata:", error);
      
      // Try to use local articles instead
      const localArticles = localStorage.getItem('manusSportsArticles');
      if (localArticles) {
        console.log("Using articles from local storage");
        return true;
      }
      
      // If no local articles, store empty array
      localStorage.setItem('manusSportsArticles', JSON.stringify([]));
      return true;
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
