
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData } from '@/contexts/DataContext';

const AdminDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { articles, walletBalance, earnings, authors } = useData();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Calculate total views
  const totalViews = articles.reduce((total, article) => total + article.views.total, 0);
  
  // Calculate total earnings
  const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
  
  // Most viewed articles (top 5)
  const mostViewedArticles = [...articles]
    .sort((a, b) => b.views.total - a.views.total)
    .slice(0, 5);
  
  // Latest earnings (most recent 5)
  const latestEarnings = [...earnings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const statsCards = [
    {
      title: 'Total Articles',
      value: articles.length,
      icon: FileText,
      change: '+2 this month',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Total Views',
      value: totalViews,
      icon: TrendingUp,
      change: '+15% from last month',
      color: 'bg-green-100 text-green-700'
    },
    {
      title: 'Wallet Balance',
      value: `$${walletBalance.toFixed(2)}`,
      icon: DollarSign,
      change: 'Last updated today',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      title: 'Authors',
      value: authors.length,
      icon: Users,
      change: 'Active content creators',
      color: 'bg-amber-100 text-amber-700'
    }
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <Button onClick={() => navigate('/admin/articles/new')}>
              <PlusCircle size={18} className="mr-2" />
              New Article
            </Button>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Viewed Articles */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-4">Most Viewed Articles</h2>
              <div className="space-y-4">
                {mostViewedArticles.map(article => (
                  <div key={article.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <h3 className="font-medium line-clamp-1">{article.title}</h3>
                      <p className="text-xs text-gray-500">{article.category} • {article.readTime} min read</p>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp size={14} className="text-green-500 mr-1" />
                      <span className="font-semibold">{article.views.total}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/analytics')}>
                View All Analytics
              </Button>
            </div>
            
            {/* Recent Earnings */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-4">Recent Earnings</h2>
              <div className="space-y-4">
                {latestEarnings.map(earning => {
                  const article = articles.find(a => a.id === earning.articleId);
                  return (
                    <div key={earning.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div>
                        <h3 className="font-medium line-clamp-1">{article?.title || 'Unknown Article'}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(earning.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-green-600 font-semibold">
                        +${earning.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/admin/wallet')}>
                View Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <DataProvider>
      <AdminDashboardContent />
    </DataProvider>
  );
};

export default AdminDashboard;
