
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CategoryNav from '@/components/CategoryNav';
import ArticleCard from '@/components/ArticleCard';
import { Input } from '@/components/ui/input';
import { useData, CategoryType } from '@/contexts/DataContext';
import { Filter, Search } from 'lucide-react';
import { useXataStorage } from '@/hooks/use-xata-storage';

const ArticlesPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const { articles, authors } = useData();
  const { syncFromXata } = useXataStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  
  useEffect(() => {
    // Try to sync articles from Xata when component mounts
    syncFromXata().catch(err => {
      console.error("Error syncing from Xata on articles page:", err);
    });
  }, [syncFromXata]);
  
  const filteredArticles = articles.filter(article => {
    // Filter by category if specified
    const categoryMatch = category 
      ? article.category === category 
      : true;
    
    // Filter by search query
    const searchMatch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });
  
  // Sort articles based on selected option
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    } else if (sortOption === 'oldest') {
      return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
    } else if (sortOption === 'most-read') {
      return b.views.total - a.views.total;
    }
    return 0;
  });
  
  const getAuthorById = (authorId: string) => {
    return authors.find(author => author.id === authorId) || authors[0];
  };
  
  return (
    <>
      <NavBar />
      <CategoryNav />
      
      <main className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            {category ? `${category} Articles` : 'All Articles'}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="bg-transparent border border-gray-200 rounded-md p-2"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-read">Most Read</option>
              </select>
            </div>
          </div>
          
          {sortedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  author={getAuthorById(article.authorId)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ArticlesPage;
