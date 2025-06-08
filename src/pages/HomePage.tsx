
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Globe, RefreshCw, Clock } from 'lucide-react';
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
  const [generationProgress, setGenerationProgress] = useState('');
  const [lastGenerated, setLastGenerated] = useState<string>('');
  
  const categories = ['Football', 'Basketball', 'Cricket', 'Tennis', 'Athletics', 'Formula 1'];
  
  useEffect(() => {
    const checkLastGeneration = () => {
      const lastGen = localStorage.getItem('lastArticleGeneration');
      if (lastGen) {
        setLastGenerated(lastGen);
      }
    };
    
    checkLastGeneration();
    
    // Auto-load articles if they exist
    if (articles.length === 0) {
      syncFromXata(false);
    }
  }, []);
  
  const generateAllArticles = async () => {
    setIsGenerating(true);
    setGenerationProgress('Starting generation...');
    let successCount = 0;
    
    try {
      console.log("🚀 Starting fast article generation for all categories...");
      
      // Generate articles for all categories simultaneously for speed
      const promises = categories.map(async (category, index) => {
        try {
          setGenerationProgress(`Generating ${category} articles...`);
          console.log(`📝 Generating articles for ${category}...`);
          
          const { data, error } = await supabase.functions.invoke('generate-articles', {
            body: { category }
          });

          if (error) {
            console.error(`❌ Error for ${category}:`, error);
            return { category, success: false, error };
          }

          if (data?.success) {
            console.log(`✅ Generated ${data.count || 6} articles for ${category}`);
            return { category, success: true, count: data.count };
          }
          
          return { category, success: false, error: 'Unknown error' };
        } catch (error) {
          console.error(`💥 Failed to generate articles for ${category}:`, error);
          return { category, success: false, error };
        }
      });
      
      // Wait for all categories to complete (parallel processing for speed)
      const results = await Promise.all(promises);
      successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        const today = new Date().toDateString();
        localStorage.setItem('lastArticleGeneration', today);
        setLastGenerated(today);
        
        toast.success(`🎉 Successfully generated articles for ${successCount}/${categories.length} categories!`);
        
        // Sync and refresh
        setGenerationProgress('Loading articles...');
        await syncFromXata(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("❌ Failed to generate any articles");
      }
      
    } catch (error) {
      console.error('💥 Error in article generation:', error);
      toast.error("Failed to generate articles");
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
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
  
  const shouldShowGeneration = () => {
    const today = new Date().toDateString();
    return lastGenerated !== today && articles.length === 0;
  };
  
  return (
    <>
      <NavBar />
      <CategoryNav />
      
      <main className="container mx-auto px-4 md:px-6">
        {/* Modern Hero Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white rounded-2xl p-8 md:p-12 mb-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Manus Sports Hub
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                AI-Powered Sports News & Analysis Platform
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="flex items-center justify-center space-x-3 bg-white/10 rounded-lg p-4">
                  <TrendingUp className="h-8 w-8" />
                  <div className="text-left">
                    <h3 className="font-semibold">Live Updates</h3>
                    <p className="text-sm opacity-80">Real-time sports news</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-white/10 rounded-lg p-4">
                  <Users className="h-8 w-8" />
                  <div className="text-left">
                    <h3 className="font-semibold">AI Analysis</h3>
                    <p className="text-sm opacity-80">Smart insights</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 bg-white/10 rounded-lg p-4">
                  <Globe className="h-8 w-8" />
                  <div className="text-left">
                    <h3 className="font-semibold">Global Sports</h3>
                    <p className="text-sm opacity-80">Worldwide coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Generation Status */}
        {isGenerating && (
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">⚡ Fast AI Article Generation</h3>
              <p className="text-blue-700 mb-2">{generationProgress}</p>
              <p className="text-sm text-blue-600">Creating unique content with professional images (10 seconds)</p>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {shouldShowGeneration() && (
              <Button 
                onClick={generateAllArticles} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <Clock className="w-5 h-5" />
                Generate Fresh Articles (10s)
              </Button>
            )}
            <Button 
              onClick={handleRefresh} 
              disabled={isSyncing}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Refresh Articles
            </Button>
          </div>
        </section>
        
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">🔥 Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  author={getAuthorById(article.authorId)} 
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Category Sections - Enhanced Grid Format */}
        {Object.entries(categoryArticles).map(([category, articles]) => (
          <section key={category} className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">{category}</h2>
              <Link 
                to={`/articles/${category}`} 
                className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="ml-2 h-5 w-5" />
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
                <div className="col-span-3 text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">🤖 Generating {category} articles...</p>
                  <p className="text-gray-400 text-sm mt-2">This will take about 10 seconds</p>
                </div>
              )}
            </div>
          </section>
        ))}
        
        {/* Stats Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">📊 Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{articles.length}</div>
                <div className="text-gray-600 font-medium">AI Articles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">6</div>
                <div className="text-gray-600 font-medium">Sports Categories</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {articles.reduce((sum, article) => sum + article.views.total, 0)}
                </div>
                <div className="text-gray-600 font-medium">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">⚡</div>
                <div className="text-gray-600 font-medium">10s Generation</div>
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
