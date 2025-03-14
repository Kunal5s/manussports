
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';

const AuthorProfile: React.FC = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const { authors, articles, getAuthorById, addArticleView } = useData();
  
  const author = authorId ? getAuthorById(authorId) : null;
  
  // Track author page view for analytics
  useEffect(() => {
    // Analytics tracking could be added here
    console.log(`Author profile viewed: ${author?.name || 'Unknown'}`);
  }, [author]);
  
  if (!author) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Author Not Found</h1>
          <p className="text-gray-600">The author you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </>
    );
  }
  
  // Get all articles written by this author
  const authorArticles = articles.filter(article => article.authorId === authorId);
  
  return (
    <>
      <NavBar />
      
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 shrink-0">
                  <img 
                    src={author.profileImage || '/public/placeholder.svg'} 
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
                  <p className="text-gray-600 mb-4">{author.email}</p>
                  <div className="prose max-w-none">
                    <p>{author.bio}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{authorArticles.length}</p>
                        <p className="text-sm text-gray-500">Articles Published</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {authorArticles.reduce((sum, article) => sum + article.views.total, 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Total Views</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-bold mb-6">Articles by {author.name}</h2>
          
          {authorArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {authorArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  author={author} 
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">This author hasn't published any articles yet.</p>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default AuthorProfile;
