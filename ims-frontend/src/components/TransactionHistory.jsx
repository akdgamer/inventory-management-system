import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TransactionHistory = ({ itemId }) => {
  const { fetchWithAuth } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (itemId) {
      fetchTransactions();
    }
  }, [itemId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/items/${itemId}/transactions`);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatReason = (reason) => {
    return reason.charAt(0).toUpperCase() + reason.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error loading transactions: {error}</p>
        <button
          onClick={fetchTransactions}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No transactions found for this item.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Transaction History</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-sm text-gray-200">
                  {formatDate(transaction.created_at)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    transaction.transaction_type === 'IN' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {transaction.transaction_type === 'IN' ? 'Stock In' : 'Stock Out'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-200">
                  {transaction.transaction_type === 'IN' ? '+' : '-'}{transaction.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-200">
                  {formatReason(transaction.reason)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-200">
                  {transaction.reference_number || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-200">
                  {transaction.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;