
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Skeleton } from '@/components/ui/skeleton';

export const TransactionsTable: React.FC = () => {
  const { earnings, getArticleById } = useData();
  const [isLoading, setIsLoading] = React.useState(false);

  return (
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
          {isLoading ? (
            <tr>
              <td colSpan={3} className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </td>
            </tr>
          ) : earnings.length > 0 ? (
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
  );
};
