
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Globe, RefreshCw } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import CategoryNav from '@/components/CategoryNav';
import ArticleCard from '@/components/ArticleCard';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useXataStorage } from '@/hooks/use-xata-storage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HomePage: React.FC = () => {
  const { articles, authors } = useData();
  const { syncFromXata, isSyncing } = useXataStorage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedToday, setHasGeneratedToday] = useState(false);
  
  const categories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Athletics', 'Formula 1'];
  
  useEffect(() => {
    // Check if articles were generated today
    const checkAndGenerateArticles = async () => {
      const lastGenerated = localStorage.getItem('lastArticleGeneration');
      const today = new Date().toDateString();
      
      if (lastGenerated !== today && articles.length === 0) {
        await generateAllArticles();
        localStorage.setItem('lastArticleGeneration', today);
        setHasGeneratedToday(true);
      } else {
        // Load existing articles
        await syncFromXata(false);
      }
    };
    
    checkAndGenerateArticles();
  }, []);
  
  const generateAllArticles = async () => {
    setIsGenerating(true);
    let successCount = 0;
    
    try {
      console.log("Starting automatic article generation for all categories...");
      
      for (const category of categories) {
        try {
          console.log(`Generating articles for ${category}...`);
          
          const { data, error } = await supabase.functions.invoke('generate-articles', {
            body: { category }
          });

          if (error) {
            console.error('Edge function error:', error);
            continue;
          }

          if (data?.success) {
            successCount++;
            console.log(`Generated ${data.count || 6} articles for ${category}`);
          }
          
          // Add delay between categories to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error(`Failed to generate articles for ${category}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully generated articles for ${successCount} categories!`);
        
        // Sync articles and refresh page
        await syncFromXata(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error in automatic article generation:', error);
      toast.error("Failed to generate articles automatically");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRefresh = async () => {
    try {
      await syncFromXata(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error refreshing articles:", err);
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

        {/* Auto Generation Status */}
        {isGenerating && (
          <section className="mb-16">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">🚀 AI is generating fresh sports articles...</h3>
              <p className="text-blue-700">Creating unique content for all sports categories with professional images</p>
            </div>
          </section>
        )}

        {/* Refresh Button */}
        <section className="mb-8">
          <div className="flex justify-center">
            <Button 
              onClick={handleRefresh} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh Articles
            </Button>
          </div>
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
                <p className="text-gray-500">Generating featured articles...</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Category Sections - Grid Format */}
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
                  <p className="text-gray-500">Generating {category} articles...</p>
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
                <div className="text-gray-600">Auto Updates</div>
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
