
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Check } from 'lucide-react';

export const WithdrawalsTable: React.FC = () => {
  const { withdrawals } = useData();

  return (
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
                <td className="px-2 md:px-4 py-3">Polar</td>
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
  );
};
