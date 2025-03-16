
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

// Xata API details - using exact format from error logs
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
      
      // First delete all existing articles in Xata (simplified approach)
      const existingResponse = await fetch(`${XATA_BASE_URL}/tables/articles/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XATA_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Xata-Agent': 'Manus Sports/1.0'
        },
        body: JSON.stringify({
          columns: ["id"]
        })
      });
      
      if (!existingResponse.ok) {
        // If table doesn't exist, try to create it
        if (existingResponse.status === 404) {
          console.log("Table doesn't exist, attempting to save directly");
        } else {
          throw new Error(`Failed to fetch existing articles: ${existingResponse.status}`);
        }
      } else {
        const existingData = await existingResponse.json();
        
        // Delete existing records if any exist
        if (existingData.records && existingData.records.length > 0) {
          for (const record of existingData.records) {
            await fetch(`${XATA_BASE_URL}/tables/articles/data/${record.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${XATA_API_KEY}`,
                'X-Xata-Agent': 'Manus Sports/1.0'
              }
            });
          }
        }
      }
      
      // Add new articles
      for (const article of articlesToSave) {
        const xataArticle = {
          title: article.title,
          feature_image: article.featuredImage,
          content: JSON.stringify(article), // Store whole article object as content
          link: `/article/${article.id}`, // Create link to article
          youtube_link: "" // Empty for now, can be added later if needed
        };
        
        await fetch(`${XATA_BASE_URL}/tables/articles/data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${XATA_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Xata-Agent': 'Manus Sports/1.0'
          },
          body: JSON.stringify(xataArticle)
        });
      }
      
      console.log("Successfully saved articles to Xata");
      toast({
        title: "Backup successful",
        description: "All articles have been backed up to Xata database.",
      });
    } catch (error) {
      console.error("Error saving to Xata:", error);
      toast({
        title: "Backup failed",
        description: "Failed to backup articles to Xata. Check console for details.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Sync articles from Xata
  const syncFromXata = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      
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
        // Use the mock data if the API fails to connect
        console.log("Failed to connect to Xata, using local article storage");
        return;
      }
      
      const data = await response.json();
      
      if (!data.records || data.records.length === 0) {
        console.log("No articles found in Xata");
        return;
      }
      
      // Clear current articles first if we have records from Xata
      localStorage.removeItem('manusSportsArticles');
      
      // Process each article from Xata
      for (const record of data.records) {
        try {
          // Parse the full article from content field
          const fullArticle = JSON.parse(record.content);
          
          // Add article to local state
          if (fullArticle.id && fullArticle.title && fullArticle.content) {
            const existingArticle = articles.find(a => a.id === fullArticle.id);
            
            if (!existingArticle) {
              // New article
              addArticle({
                title: fullArticle.title,
                summary: fullArticle.summary,
                content: fullArticle.content,
                category: fullArticle.category,
                authorId: fullArticle.authorId,
                readTime: fullArticle.readTime,
                featuredImage: fullArticle.featuredImage || record.feature_image
              });
            } else {
              // Update existing article
              updateArticle(fullArticle);
            }
          }
        } catch (parseError) {
          console.error("Error parsing article from Xata:", parseError);
        }
      }
      
      console.log("Successfully synced articles from Xata");
      toast({
        title: "Sync successful",
        description: "Articles have been synchronized from Xata database.",
      });
    } catch (error) {
      console.error("Error syncing from Xata:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync articles from Xata. Using local storage only.",
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
