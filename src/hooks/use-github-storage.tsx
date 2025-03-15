
import { useState } from 'react';
import { useData, Article } from '@/contexts/DataContext';

const GITHUB_USERNAME = "Kunal5s";
const REPO_NAME = "manussports";
const FILE_PATH = "articles.json";
const BRANCH = "main";
const TOKEN = "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";

export const useGitHubStorage = () => {
  const { articles, addArticle, deleteArticle, updateArticle } = useData();
  const [isSyncing, setIsSyncing] = useState(false);

  const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;

  const saveToGitHub = async (articlesToSave: Article[]): Promise<void> => {
    try {
      setIsSyncing(true);
      let sha = null;
      
      // First get the current file to get the SHA (needed for updating)
      try {
        const response = await fetch(API_URL, {
          headers: { 
            Authorization: `token ${TOKEN}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.v3+json"
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          sha = data.sha;
        } else if (response.status !== 404) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching file from GitHub:", error);
        if (!(error instanceof Error && error.message.includes("404"))) {
          throw error;
        }
      }
      
      // Prepare and encode content
      const content = JSON.stringify(articlesToSave, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(content)));
      
      // Create or update the file
      const requestBody = {
        message: "Update articles from Manus Sports Admin",
        content: encodedContent,
        branch: BRANCH
      };
      
      if (sha) {
        // If file exists, we need the SHA to update it
        Object.assign(requestBody, { sha });
      }
      
      const updateResponse = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json"
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Failed to save to GitHub: ${errorData.message}`);
      }
      
      console.log("Successfully saved articles to GitHub");
    } catch (error) {
      console.error("Error saving to GitHub:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };
  
  const syncFromGitHub = async (): Promise<void> => {
    try {
      setIsSyncing(true);
      
      // Fetch articles from GitHub
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `token ${TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = decodeURIComponent(escape(atob(data.content)));
      const githubArticles: Article[] = JSON.parse(content);
      
      // Update local articles with GitHub ones
      // Find new or updated articles from GitHub
      for (const githubArticle of githubArticles) {
        const existingArticle = articles.find(a => a.id === githubArticle.id);
        
        if (!existingArticle) {
          // This is a new article from GitHub, add it locally
          addArticle({
            title: githubArticle.title,
            summary: githubArticle.summary,
            content: githubArticle.content,
            category: githubArticle.category,
            authorId: githubArticle.authorId,
            readTime: githubArticle.readTime,
            featuredImage: githubArticle.featuredImage
          });
        } else {
          // This article exists locally, update it with GitHub version
          updateArticle(githubArticle);
        }
      }
      
      // Find articles in local storage that don't exist in GitHub (to be removed)
      const githubArticleIds = new Set(githubArticles.map(a => a.id));
      const articlesToDelete = articles.filter(a => !githubArticleIds.has(a.id));
      
      for (const articleToDelete of articlesToDelete) {
        deleteArticle(articleToDelete.id);
      }
      
      console.log("Successfully synced articles from GitHub");
    } catch (error) {
      console.error("Error syncing from GitHub:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    saveToGitHub,
    syncFromGitHub,
    isSyncing
  };
};
