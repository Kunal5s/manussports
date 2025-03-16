
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

// Xata API details
const XATA_API_KEY = "xau_QNGaxjicleu6dFRunfVpoSZWD46BC3Ru6";
const XATA_BASE_URL = "https://Kunal-Sonpitre-s-workspace-uftkup.eu-central-1.xata.sh/db/my_blog_db";

export const useXataStorage = () => {
  const { articles, addArticle, deleteArticle, updateArticle } = useData();
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Save articles to Xata
  const saveToXata = async (articlesToSave: Article[]): Promise<void> => {
    try {
      setIsSyncing(true);
      
      // Prepare articles for Xata format
      for (const article of articlesToSave) {
        const xataArticle = {
          title: article.title,
          feature_image: article.featuredImage,
          content: JSON.stringify(article), // Store whole article object as content
          link: `/article/${article.id}`, // Create link to article
          youtube_link: "" // Empty for now
        };
        
        try {
          // We'll use a direct POST to create/update each article
          // Using article.id as the record identifier
          await fetch(`${XATA_BASE_URL}/tables/articles/data/${article.id}`, {
            method: 'PUT', // PUT will create or update
            headers: {
              'Authorization': `Bearer ${XATA_API_KEY}`,
              'Content-Type': 'application/json',
              'X-Xata-Agent': 'Manus Sports/1.0'
            },
            body: JSON.stringify(xataArticle)
          });
          
          console.log(`Successfully saved article: ${article.title}`);
        } catch (articleError) {
          console.error(`Error saving article ${article.id}:`, articleError);
          // Continue with other articles even if one fails
        }
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
      
      // First check if the table exists by making a simple query
      const tableCheckResponse = await fetch(`${XATA_BASE_URL}/tables/articles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${XATA_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Xata-Agent': 'Manus Sports/1.0'
        }
      });
      
      if (!tableCheckResponse.ok) {
        if (tableCheckResponse.status === 404) {
          // Table doesn't exist yet, we'll create it when we save articles
          console.log("Articles table doesn't exist yet. Will be created on first save.");
          toast({
            title: "No articles found",
            description: "No articles found in the database. Start by creating some!",
          });
          return;
        } else {
          throw new Error(`Database connection error: ${tableCheckResponse.status}`);
        }
      }
      
      // Table exists, query for articles
      const response = await fetch(`${XATA_BASE_URL}/tables/articles/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XATA_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Xata-Agent': 'Manus Sports/1.0'
        },
        body: JSON.stringify({
          columns: ["id", "title", "feature_image", "content"]
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync from Xata: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        console.log("No articles found in Xata");
        toast({
          title: "No articles found",
          description: "No articles found in the database. Start by creating some!",
        });
        return;
      }
      
      // Process each article from Xata
      const loadedArticles: Article[] = [];
      
      for (const record of data.records) {
        try {
          // Parse the full article from content field
          const fullArticle = JSON.parse(record.content);
          
          if (fullArticle.id && fullArticle.title && fullArticle.content) {
            loadedArticles.push(fullArticle);
          }
        } catch (parseError) {
          console.error("Error parsing article from Xata:", parseError);
        }
      }
      
      if (loadedArticles.length > 0) {
        // Remove all current articles and replace with ones from Xata
        localStorage.removeItem('manusSportsArticles');
        localStorage.setItem('manusSportsArticles', JSON.stringify(loadedArticles));
        
        // Force a page reload to refresh the DataContext with new articles
        window.location.reload();
      }
      
      toast({
        title: "Sync successful",
        description: `${loadedArticles.length} articles loaded from database.`,
      });
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
