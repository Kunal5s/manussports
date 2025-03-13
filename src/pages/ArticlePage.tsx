
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataProvider, useData } from '@/contexts/DataContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CategoryNav from '@/components/CategoryNav';
import { Clock, Eye, User } from 'lucide-react';

const ArticlePageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { articles, authors, addArticleView } = useData();
  const [viewRecorded, setViewRecorded] = useState(false);
  const [readingTimeElapsed, setReadingTimeElapsed] = useState(0);
  const [readComplete, setReadComplete] = useState(false);
  
  const article = articles.find(a => a.id === id);
  const author = article ? authors.find(a => a.id === article.authorId) : null;
  
  useEffect(() => {
    if (!article) {
      navigate('/not-found');
      return;
    }
    
    // Record view only once when the article is loaded
    if (!viewRecorded && article) {
      console.log("Recording view for article:", article.id);
      addArticleView(article.id);
      setViewRecorded(true);
    }
    
    // Start a timer to track reading time
    const readingTimer = setInterval(() => {
      setReadingTimeElapsed(prev => {
        // If read time reaches at least 1 minute (60 seconds), mark as complete
        if (prev >= 59 && !readComplete) {
          setReadComplete(true);
          console.log("Article read time complete: 1 minute reached");
        }
        return prev + 1;
      });
    }, 1000); // Update every second
    
    return () => clearInterval(readingTimer);
  }, [article, viewRecorded, addArticleView, navigate, readComplete]);
  
  if (!article || !author) {
    return <div>Article not found</div>;
  }
  
  // Format the published date
  const publishedDate = new Date(article.publishedDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <>
      <NavBar />
      <CategoryNav />
      
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <span className="inline-block bg-black text-white px-3 py-1 text-sm font-medium rounded mb-4">
            {article.category}
          </span>
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center text-gray-500 mb-6">
            <div className="flex items-center mr-6">
              <User className="h-4 w-4 mr-1" />
              <span>{author.name}</span>
            </div>
            <div className="flex items-center mr-6">
              <Clock className="h-4 w-4 mr-1" />
              <span>{article.readTime} min read</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>{article.views.total} views</span>
            </div>
          </div>
        </div>
        
        {article.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={article.featuredImage} 
              alt={article.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="prose max-w-none mb-10">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        
        <div className="border-t pt-6">
          <p className="text-gray-500 text-sm">
            Published on {publishedDate}
          </p>
        </div>
        
        {/* Reading time indicator (hidden in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded-lg opacity-70">
            Reading: {Math.floor(readingTimeElapsed / 60)}m {readingTimeElapsed % 60}s
            {readComplete && " (Completed)"}
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
};

const ArticlePage: React.FC = () => {
  return (
    <DataProvider>
      <ArticlePageContent />
    </DataProvider>
  );
};

export default ArticlePage;
