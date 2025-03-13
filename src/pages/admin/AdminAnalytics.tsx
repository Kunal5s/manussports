
import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const viewsData = [
  { name: 'Jan', views: 4000 },
  { name: 'Feb', views: 3000 },
  { name: 'Mar', views: 2000 },
  { name: 'Apr', views: 2780 },
  { name: 'May', views: 1890 },
  { name: 'Jun', views: 2390 },
  { name: 'Jul', views: 3490 },
];

const earningsData = [
  { name: 'Jan', earnings: 2400 },
  { name: 'Feb', earnings: 1398 },
  { name: 'Mar', earnings: 9800 },
  { name: 'Apr', earnings: 3908 },
  { name: 'May', earnings: 4800 },
  { name: 'Jun', earnings: 3800 },
  { name: 'Jul', earnings: 4300 },
];

const topArticles = [
  { id: 1, title: 'Top 10 Football Moments of 2023', views: 1256, earnings: 628 },
  { id: 2, title: 'The Rise of Basketball in Europe', views: 984, earnings: 492 },
  { id: 3, title: 'Cricket World Cup Preview', views: 876, earnings: 438 },
  { id: 4, title: 'Tennis Grand Slam Analysis', views: 765, earnings: 382.5 },
  { id: 5, title: 'Formula 1: Season Highlights', views: 654, earnings: 327 },
];

const AdminAnalytics: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Views</CardDescription>
              <CardTitle className="text-3xl">24,789</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl">$12,394.50</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Articles Published</CardDescription>
              <CardTitle className="text-3xl">32</CardTitle>
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
                      {topArticles.map((article) => (
                        <tr key={article.id} className="border-b">
                          <td className="px-4 py-3">{article.id}</td>
                          <td className="px-4 py-3">{article.title}</td>
                          <td className="px-4 py-3 text-right">{article.views.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">${article.earnings.toFixed(2)}</td>
                        </tr>
                      ))}
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
