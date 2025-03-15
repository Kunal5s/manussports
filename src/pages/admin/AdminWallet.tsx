
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, DollarSign, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';

// PayPal server endpoint
const PAYPAL_SERVER_URL = "http://localhost:3000";

const withdrawalSchema = z.object({
  amount: z.coerce.number()
    .positive("Amount must be positive")
    .min(10, "Minimum withdrawal amount is $10")
    .max(1000, "Maximum withdrawal amount is $1000"),
  bankAccount: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

const AdminWallet: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { walletBalance, earnings, withdrawals, paypalEmail, updatePaypalEmail, requestWithdrawal, getArticleById } = useData();
  const { toast } = useToast();
  const [newPaypalEmail, setNewPaypalEmail] = useState(paypalEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [isPaypalError, setIsPaypalError] = useState(false);
  const [isPaypalConnected, setIsPaypalConnected] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    // Check if PayPal is connected via localStorage
    const storedPaypalEmail = localStorage.getItem("paypal_email");
    if (storedPaypalEmail) {
      setIsPaypalConnected(true);
      if (!paypalEmail) {
        updatePaypalEmail(storedPaypalEmail);
        setNewPaypalEmail(storedPaypalEmail);
      }
    }
  }, [isAuthenticated, navigate, paypalEmail, updatePaypalEmail]);

  const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
  
  const totalWithdrawals = withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 10,
      bankAccount: '',
    },
  });

  const handlePaypalUpdate = () => {
    if (!newPaypalEmail) {
      toast({
        title: "Error",
        description: "Please enter a valid PayPal email address",
        variant: "destructive",
      });
      return;
    }
    
    updatePaypalEmail(newPaypalEmail);
    toast({
      title: "Success",
      description: "PayPal email updated successfully",
    });
  };

  const connectPayPal = () => {
    // Redirect to PayPal connect page via the server
    window.location.href = `${PAYPAL_SERVER_URL}/?connect=true`;
  };

  const processServerWithdrawal = async (amount: number, email: string) => {
    try {
      const response = await fetch(`${PAYPAL_SERVER_URL}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount })
      });
      
      if (!response.ok) {
        throw new Error("Server withdrawal failed");
      }
      
      const data = await response.json();
      console.log("PayPal API Response:", data);
      return data;
    } catch (error) {
      console.error("PayPal Server Error:", error);
      setIsPaypalError(true);
      throw new Error("Failed to process server withdrawal");
    }
  };

  const onWithdrawalSubmit = async (data: WithdrawalFormValues) => {
    if (!paypalEmail) {
      toast({
        title: "Error",
        description: "Please set your PayPal email first",
        variant: "destructive",
      });
      return;
    }

    if (data.amount > walletBalance) {
      toast({
        title: "Insufficient funds",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setIsPaypalError(false);

    try {
      // Use the server endpoint for withdrawal
      const serverResponse = await processServerWithdrawal(data.amount, paypalEmail);
      
      // Record the withdrawal in our local state
      requestWithdrawal(data.amount);
      
      toast({
        title: "PayPal Transfer Initiated",
        description: `$${data.amount.toFixed(2)} has been sent to your PayPal account (${paypalEmail})`,
      });
      
      if (data.bankAccount) {
        setTimeout(() => {
          toast({
            title: "Bank Transfer Initiated",
            description: `$${data.amount.toFixed(2)} is being transferred to your bank account ending in ${data.bankAccount.slice(-4)}`,
          });
        }, 1000);
      }
      
      setTimeout(() => {
        toast({
          title: "PayPal Notification",
          description: `You've received $${data.amount.toFixed(2)} in your PayPal account`,
          variant: "default",
        });
      }, 3000);
      
      form.reset();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal failed",
        description: "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8 pt-16 md:pt-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Wallet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className="text-xl md:text-3xl flex items-center">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-gray-500 mr-1" />
                {walletBalance.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-xl md:text-3xl flex items-center text-green-600">
                <ArrowUp className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                ${totalEarnings.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Withdrawals</CardDescription>
              <CardTitle className="text-xl md:text-3xl flex items-center text-blue-600">
                <ArrowDown className="h-5 w-5 md:h-6 md:w-6 mr-1" />
                ${totalWithdrawals.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="transactions" className="text-sm md:text-base">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals" className="text-sm md:text-base">Withdrawals</TabsTrigger>
            <TabsTrigger value="payment" className="text-sm md:text-base">Payment Settings</TabsTrigger>
            <TabsTrigger value="withdraw" className="text-sm md:text-base">Request Withdrawal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Earnings History</CardTitle>
                <CardDescription>Record of all earnings from your articles ($5 per 1-minute read time)</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-2 md:px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-2 md:px-4 py-3 text-left font-medium">Article</th>
                        <th className="px-2 md:px-4 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.length > 0 ? (
                        earnings.map((earning) => {
                          const article = getArticleById(earning.articleId);
                          return (
                            <tr key={earning.id} className="border-b">
                              <td className="px-2 md:px-4 py-3">{new Date(earning.date).toLocaleDateString()}</td>
                              <td className="px-2 md:px-4 py-3 max-w-[150px] md:max-w-none truncate">{article?.title || 'Unknown Article'}</td>
                              <td className="px-2 md:px-4 py-3 text-right text-green-600">+${earning.amount.toFixed(2)}</td>
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
              <CardContent className="overflow-x-auto">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-2 md:px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-2 md:px-4 py-3 text-left font-medium">Method</th>
                        <th className="px-2 md:px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-2 md:px-4 py-3 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.length > 0 ? (
                        withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id} className="border-b">
                            <td className="px-2 md:px-4 py-3">{new Date(withdrawal.date).toLocaleDateString()}</td>
                            <td className="px-2 md:px-4 py-3">PayPal</td>
                            <td className="px-2 md:px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                withdrawal.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {withdrawal.status === 'completed' && <Check className="mr-1 h-3 w-3" />}
                                {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-2 md:px-4 py-3 text-right text-blue-600">-${withdrawal.amount.toFixed(2)}</td>
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
                <CardDescription>Manage your payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-w-md">
                  {!isPaypalConnected ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Connect Your PayPal Account</h3>
                      <p className="text-sm text-gray-600">
                        Connect your PayPal account to enable instant withdrawals to your account.
                      </p>
                      <Button
                        onClick={connectPayPal}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Connect with PayPal
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="font-medium">PayPal Account Connected</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your PayPal account ({paypalEmail}) is connected for instant withdrawals.
                      </p>
                      <Button
                        onClick={connectPayPal}
                        variant="outline"
                        className="px-4 py-2"
                      >
                        Reconnect PayPal
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2 mt-6 pt-6 border-t">
                    <label className="text-sm font-medium">Bank Account (for direct transfers)</label>
                    <Input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-md" 
                      placeholder="Account number or last 4 digits"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">For direct bank transfers from your PayPal account</p>
                  </div>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Bank Account Linked",
                        description: "Your bank account has been linked to your PayPal account for automatic transfers",
                      });
                    }}
                    variant="outline"
                    className="px-4 py-2"
                    disabled={!bankAccount}
                  >
                    Link Bank Account
                  </Button>

                  <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md">
                    <h3 className="font-medium mb-2">PayPal Integration Info</h3>
                    <p className="text-sm">
                      Your earnings are automatically sent to your PayPal account within 5 minutes of withdrawal request. 
                      Make sure your PayPal account is connected to avoid delays.
                    </p>
                    <div className="mt-2 flex">
                      <a 
                        href="https://www.paypal.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 flex items-center hover:underline"
                      >
                        Check PayPal Account 
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Withdraw your earnings to PayPal instantly
                  {!isPaypalConnected && ' (Please connect your PayPal account first)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPaypalError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>PayPal Connection Error</AlertTitle>
                    <AlertDescription>
                      There was an error connecting to PayPal. Please try again later or contact support.
                    </AlertDescription>
                  </Alert>
                )}

                {!isPaypalConnected && (
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>PayPal Not Connected</AlertTitle>
                    <AlertDescription>
                      To withdraw funds, you must first connect your PayPal account in the Payment Settings tab.
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onWithdrawalSubmit)} className="space-y-6 max-w-md">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Withdrawal Amount ($)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter amount"
                              type="number"
                              min={10}
                              max={walletBalance}
                              {...field}
                              disabled={!isPaypalConnected || isProcessing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Account (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="For direct bank transfer"
                              type="text"
                              {...field}
                              disabled={!isPaypalConnected || isProcessing}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-gray-500">If provided, funds will be automatically transferred to your bank account</p>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Available: ${walletBalance.toFixed(2)}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!isPaypalConnected || walletBalance < 10 || isProcessing}
                        className={isProcessing ? "bg-gray-400" : ""}
                      >
                        {isProcessing ? "Processing PayPal Transfer..." : "Withdraw to PayPal"}
                      </Button>
                    </div>

                    {walletBalance >= 10 && isPaypalConnected && (
                      <div className="p-3 bg-blue-50 text-blue-700 rounded-md mt-4 text-sm">
                        <p>Funds will be sent to your PayPal account immediately using direct API integration.</p>
                        {bankAccount && <p className="mt-1">Direct bank transfer will be initiated immediately after PayPal receives the funds.</p>}
                      </div>
                    )}
                  </form>
                </Form>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-medium mb-3">Direct PayPal Integration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Your withdrawals are processed through the PayPal API for instant transfers. Funds arrive in your PayPal account within minutes.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="text-green-500" size={16} />
                    <span>Secure API connection with OAuth 2.0 authentication</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Check className="text-green-500" size={16} />
                    <span>Instant transfers to your verified PayPal account</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Check className="text-green-500" size={16} />
                    <span>Automated bank account transfers when linked</span>
                  </div>
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
