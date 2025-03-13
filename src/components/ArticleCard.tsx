
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Article, Author } from '@/contexts/DataContext';

interface ArticleCardProps {
  article: Article;
  author: Author;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, author }) => {
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Football': return 'bg-sports-football text-white';
      case 'Basketball': return 'bg-sports-basketball text-white';
      case 'Cricket': return 'bg-sports-cricket text-white';
      case 'Tennis': return 'bg-sports-tennis text-white';
      case 'Athletics': return 'bg-sports-athletics text-white';
      case 'Formula 1': return 'bg-sports-formula1 text-white';
      default: return 'bg-gray-700 text-white';
    }
  };

  const publishedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative min-h-article overflow-hidden">
        <img 
          src={article.featuredImage || '/public/placeholder.svg'} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className={cn(
          "absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded",
          getCategoryColor(article.category)
        )}>
          {article.category}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link to={`/article/${article.id}`}>{article.title}</Link>
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src={author.profileImage || '/public/placeholder.svg'} 
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Link to={`/author/${author.id}`} className="text-sm font-medium hover:underline">
              {author.name}
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            {article.readTime} min read
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
