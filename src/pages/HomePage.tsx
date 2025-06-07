
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Globe, RefreshCw } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CategoryNav from '@/components/CategoryNav';
import ArticleCard from '@/components/ArticleCard';
import ArticleGenerator from '@/components/ArticleGenerator';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useXataStorage } from '@/hooks/use-xata-storage';

const HomePage: React.FC = () => {
  const { articles, authors } = useData();
  const { syncFromXata, isSyncing } = useXataStorage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    // Load articles on component mount
    const loadArticles = async () => {
      try {
        await syncFromXata(false);
      } catch (err) {
        console.error("Error syncing articles on homepage:", err);
      }
    };
    
    loadArticles();
  }, [syncFromXata]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncFromXata(true);
      // Force page refresh after sync
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error refreshing articles:", err);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
  
  const featuredArticles = sortedArticles.slice(0, 3);
  const categoryArticles = {
    Football: sortedArticles.filter(a => a.category === 'Football').slice(0, 6),
    Basketball: sortedArticles.filter(a => a.category === 'Basketball').slice(0, 6),
    Cricket: sortedArticles.filter(a => a.category === 'Cricket').slice(0, 6),
    Tennis: sortedArticles.filter(a => a.category === 'Tennis').slice(0, 6),
    Athletics: sortedArticles.filter(a => a.category === 'Athletics').slice(0, 6),
    'Formula 1': sortedArticles.filter(a => a.category === 'Formula 1').slice(0, 6),
  };
  
  const getAuthorById = (authorId: string) => {
    return authors.find(author => author.id === authorId) || authors[0];
  };
  
  return (
    <>
      <NavBar />
      <CategoryNav />
      
      <main className="container mx-auto px-4 md:px-6">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Manus Sports Hub
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Your Ultimate Destination for Sports News, Analysis & Insights
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">Trending News</h3>
                  <p className="text-sm opacity-80">Latest sports updates</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">Expert Analysis</h3>
                  <p className="text-sm opacity-80">In-depth coverage</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">Global Coverage</h3>
                  <p className="text-sm opacity-80">Sports from around the world</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Generator */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Article Management</h2>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing || isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(isRefreshing || isSyncing) ? 'animate-spin' : ''}`} />
              Refresh Articles
            </Button>
          </div>
          <ArticleGenerator />
        </section>
        
        {/* Featured Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.length > 0 ? (
              featuredArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  author={getAuthorById(article.authorId)} 
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No featured articles yet. Use the generator above to create some!</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Category Sections */}
        {Object.entries(categoryArticles).map(([category, articles]) => (
          <section key={category} className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">{category}</h2>
              <Link to={`/articles/${category}`} className="flex items-center text-blue-600 hover:text-blue-800">
                <span>View all</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.length > 0 ? (
                articles.map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    author={getAuthorById(article.authorId)} 
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No {category} articles yet</p>
                </div>
              )}
            </div>
          </section>
        ))}
        
        {/* Sports Stats Section */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Sports at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{articles.length}</div>
                <div className="text-gray-600">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                <div className="text-gray-600">Sports Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {articles.reduce((sum, article) => sum + article.views.total, 0)}
                </div>
                <div className="text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Live Updates</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default HomePage;
