
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Check, AlertTriangle, RefreshCw } from 'lucide-react';

export const WithdrawalsTable: React.FC = () => {
  const { withdrawals } = useData();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-2 md:px-4 py-3 text-left font-medium">Date</th>
            <th className="px-2 md:px-4 py-3 text-left font-medium">Method</th>
            <th className="px-2 md:px-4 py-3 text-left font-medium">Reference</th>
            <th className="px-2 md:px-4 py-3 text-left font-medium">Status</th>
            <th className="px-2 md:px-4 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                <td className="px-2 md:px-4 py-3">{formatDate(withdrawal.date)}</td>
                <td className="px-2 md:px-4 py-3">
                  <span className="font-medium">Polar</span>
                </td>
                <td className="px-2 md:px-4 py-3">
                  <span className="text-xs font-mono">{withdrawal.id.substring(0, 8)}</span>
                </td>
                <td className="px-2 md:px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                    withdrawal.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {withdrawal.status === 'completed' 
                      ? <Check className="mr-1 h-3 w-3" />
                      : <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    }
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-3 text-right text-blue-600 font-medium">
                  -${withdrawal.amount.toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-gray-400">No withdrawals recorded yet</span>
                  <span className="text-xs text-gray-400">Withdrawals will appear here once processed</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
