
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/AdminSidebar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, DollarSign, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePolar } from '@/hooks/use-polar';
import { WalletSummary } from '@/components/wallet/WalletSummary';
import { TransactionsTable } from '@/components/wallet/TransactionsTable';
import { WithdrawalsTable } from '@/components/wallet/WithdrawalsTable';
import { PolarSettings } from '@/components/wallet/PolarSettings';

const withdrawalSchema = z.object({
  amount: z.coerce.number()
    .positive("Amount must be positive")
    .min(10, "Minimum withdrawal amount is $10")
    .max(1000, "Maximum withdrawal amount is $1000"),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

const AdminWallet: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { walletBalance, requestWithdrawal } = useData();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const isMobile = useIsMobile();
  const polar = usePolar();
  const [polarEmail, setPolarEmail] = useState<string>(polar.getConnectedEmail() || '');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 10,
    },
  });

  const onWithdrawalSubmit = async (data: WithdrawalFormValues) => {
    if (!polarEmail) {
      toast({
        title: "Error",
        description: "Please set your Polar email first",
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

    try {
      await polar.processWithdrawal(data.amount, polarEmail);
      requestWithdrawal(data.amount);
      form.reset();
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePolarUpdate = () => {
    if (polar.connectPolarWithEmail(polarEmail)) {
      toast({
        title: "Success",
        description: "Polar account connected successfully",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8 pt-16 md:pt-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Wallet</h1>
        
        <WalletSummary />
        
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
                <TransactionsTable />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Record of all withdrawals to Polar</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <WithdrawalsTable />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Manage your Polar payment account</CardDescription>
              </CardHeader>
              <CardContent>
                <PolarSettings 
                  polarEmail={polarEmail} 
                  setPolarEmail={setPolarEmail} 
                  handlePolarUpdate={handlePolarUpdate} 
                  polar={polar}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Withdraw your earnings to your Polar account
                  {!polar.isConnected() && ' (Please connect your Polar account first)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!polar.isConnected() && (
                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Polar Account Not Connected</AlertTitle>
                    <AlertDescription>
                      To withdraw funds, you must first connect your Polar account in the Payment Settings tab.
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
                              disabled={!polar.isConnected() || isProcessing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Available: ${walletBalance.toFixed(2)}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!polar.isConnected() || walletBalance < 10 || isProcessing}
                        className={isProcessing ? "bg-gray-400" : ""}
                      >
                        {isProcessing ? "Processing Withdrawal..." : "Withdraw Funds"}
                      </Button>
                    </div>

                    {walletBalance >= 10 && polar.isConnected() && (
                      <div className="p-3 bg-blue-50 text-blue-700 rounded-md mt-4 text-sm">
                        <p>Funds will be transferred directly to your Polar account.</p>
                      </div>
                    )}
                  </form>
                </Form>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-medium mb-3">Polar Payment Integration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Withdrawals are processed securely through the Polar payment system.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Check className="text-green-500" size={16} />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Check className="text-green-500" size={16} />
                    <span>Instant transfers to your account</span>
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
