
import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useData } from '@/contexts/DataContext';

const AdminAnalytics: React.FC = () => {
  const { articles, earnings, getArticleById } = useData();
  
  // Calculate total views
  const totalViews = articles.reduce((total, article) => total + article.views.total, 0);
  
  // Calculate total earnings
  const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
  
  // Calculate total articles
  const totalArticles = articles.length;
  
  // Get monthly views data
  const generateMonthlyViewsData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Create data for 7 months (current month and 6 previous)
    return Array.from({ length: 7 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      const viewCount = articles.reduce((total, article) => {
        // Use real view data from articles
        const monthlyViews = article.views.monthly[i] || 0;
        return total + monthlyViews;
      }, 0);
      
      return {
        name: monthNames[monthIndex],
        views: viewCount
      };
    }).reverse();
  };
  
  // Get monthly earnings data
  const generateMonthlyEarningsData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Group earnings by month
    const monthlyEarnings = Array(7).fill(0);
    
    earnings.forEach(earning => {
      const earningDate = new Date(earning.date);
      const monthDiff = (currentMonth - earningDate.getMonth() + 12) % 12;
      
      if (monthDiff < 7) {
        monthlyEarnings[monthDiff] += earning.amount;
      }
    });
    
    // Create data for 7 months (current month and 6 previous)
    return Array.from({ length: 7 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return {
        name: monthNames[monthIndex],
        earnings: monthlyEarnings[i]
      };
    }).reverse();
  };
  
  // Get top performing articles based on views and earnings
  const getTopArticles = () => {
    // Map articles with their earnings
    const articlesWithEarnings = articles.map(article => {
      const articleEarnings = earnings
        .filter(earning => earning.articleId === article.id)
        .reduce((total, earning) => total + earning.amount, 0);
      
      return {
        id: article.id,
        title: article.title,
        views: article.views.total,
        earnings: articleEarnings
      };
    });
    
    // Sort by earnings (descending)
    return articlesWithEarnings
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5); // Top 5 articles
  };
  
  const viewsData = generateMonthlyViewsData();
  const earningsData = generateMonthlyEarningsData();
  const topArticles = getTopArticles();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Views</CardDescription>
              <CardTitle className="text-3xl">{totalViews.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl">${totalEarnings.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Articles Published</CardDescription>
              <CardTitle className="text-3xl">{totalArticles}</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <Tabs defaultValue="views" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="views">Views Analytics</TabsTrigger>
            <TabsTrigger value="earnings">Earnings Analytics</TabsTrigger>
            <TabsTrigger value="performance">Top Performing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="views">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Views</CardTitle>
                <CardDescription>Number of views per month</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Earnings per month in USD</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Articles</CardTitle>
                <CardDescription>Articles with the highest views and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium">#</th>
                        <th className="px-4 py-3 text-left font-medium">Title</th>
                        <th className="px-4 py-3 text-right font-medium">Views</th>
                        <th className="px-4 py-3 text-right font-medium">Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topArticles.length > 0 ? (
                        topArticles.map((article, index) => (
                          <tr key={article.id} className="border-b">
                            <td className="px-4 py-3">{index + 1}</td>
                            <td className="px-4 py-3">{article.title}</td>
                            <td className="px-4 py-3 text-right">{article.views.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">${article.earnings.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                            No articles published yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAnalytics;
