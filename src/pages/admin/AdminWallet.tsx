
import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, DollarSign } from 'lucide-react';

const AdminWallet: React.FC = () => {
  const { walletBalance, earnings, withdrawals } = useData();

  // Calculate total earnings
  const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
  
  // Calculate total withdrawals
  const totalWithdrawals = withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className="text-3xl flex items-center">
                <DollarSign className="h-6 w-6 text-gray-500 mr-1" />
                {walletBalance.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-3xl flex items-center text-green-600">
                <ArrowUp className="h-6 w-6 mr-1" />
                ${totalEarnings.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Withdrawals</CardDescription>
              <CardTitle className="text-3xl flex items-center text-blue-600">
                <ArrowDown className="h-6 w-6 mr-1" />
                ${totalWithdrawals.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="payment">Payment Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Record of all earnings from your articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Article</th>
                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.length > 0 ? (
                        earnings.map((earning) => {
                          const article = useData().getArticleById(earning.articleId);
                          return (
                            <tr key={earning.id} className="border-b">
                              <td className="px-4 py-3">{new Date(earning.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3">{article?.title || 'Unknown Article'}</td>
                              <td className="px-4 py-3 text-right text-green-600">+${earning.amount.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-center text-gray-500">No earnings recorded yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Record of all withdrawals to PayPal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">Method</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.length > 0 ? (
                        withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="border-b">
                            <td className="px-4 py-3">{new Date(withdrawal.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">PayPal</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                withdrawal.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-blue-600">-${withdrawal.amount.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-center text-gray-500">No withdrawals recorded yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Manage your payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PayPal Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border rounded-md" 
                      placeholder="your.email@example.com"
                      defaultValue={useData().paypalEmail || ''}
                    />
                  </div>
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                    Update Payment Info
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminWallet;
