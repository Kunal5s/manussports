
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign } from 'lucide-react';

export const WalletSummary: React.FC = () => {
  const { walletBalance, earnings, withdrawals } = useData();
  
  const totalEarnings = earnings.reduce((total, earning) => total + earning.amount, 0);
  const totalWithdrawals = withdrawals.reduce((total, withdrawal) => total + withdrawal.amount, 0);

  return (
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
  );
};
