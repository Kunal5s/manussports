
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'All', path: '/articles' },
  { name: 'Football', path: '/articles/Football' },
  { name: 'Basketball', path: '/articles/Basketball' },
  { name: 'Cricket', path: '/articles/Cricket' },
  { name: 'Tennis', path: '/articles/Tennis' },
  { name: 'Athletics', path: '/articles/Athletics' },
  { name: 'Formula 1', path: '/articles/Formula 1' }
];

const CategoryNav: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const currentCategory = category || 'All';
  
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto hide-scrollbar py-2 space-x-8">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className={cn(
                "text-sm font-medium whitespace-nowrap pb-2 px-1",
                cat.name === currentCategory 
                  ? "border-b-2 border-black" 
                  : "text-gray-600 hover:text-black"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;
