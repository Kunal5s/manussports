
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CategoryNav from '@/components/CategoryNav';
import ArticleCard from '@/components/ArticleCard';
import { useData } from '@/contexts/DataContext';
import { useXataStorage } from '@/hooks/use-xata-storage';

const HomePage: React.FC = () => {
  const { articles, authors } = useData();
  const { syncFromXata } = useXataStorage();
  
  useEffect(() => {
    // Try to sync articles from Xata when component mounts
    syncFromXata().catch(err => {
      console.error("Error syncing from Xata on homepage:", err);
    });
  }, [syncFromXata]);
  
  // Sort articles by date (newest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
  
  const featuredArticles = sortedArticles.slice(0, 2);
  const recentArticles = sortedArticles.slice(2, 8);
  
  const getAuthorById = (authorId: string) => {
    return authors.find(author => author.id === authorId) || authors[0];
  };
  
  return (
    <>
      <NavBar />
      <CategoryNav />
      
      <main className="container mx-auto px-4 md:px-6">
        {/* Featured Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.length > 0 ? (
              featuredArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  author={getAuthorById(article.authorId)} 
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No featured articles yet</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Recent Articles */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Recent Articles</h2>
            <Link to="/articles" className="flex items-center text-blue-600 hover:text-blue-800">
              <span>View all</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.length > 0 ? (
              recentArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  author={getAuthorById(article.authorId)} 
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No recent articles yet</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Football', 'Basketball', 'Cricket', 'Tennis', 'Athletics', 'Formula 1'].map(category => (
              <Link
                key={category}
                to={`/articles/${category}`}
                className="group"
              >
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gray-700 opacity-70 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default HomePage;
