import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatMoney } from '../utils/currency';

export default function Dashboard() {
  const { fetchWithAuth, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isLoading && isAuthenticated) {
        try {
          setLoading(true);
          const items = await fetchWithAuth('/items/');
          
          // Calculate metrics
          const totalItems = items.length;
          const lowStockItems = items.filter(item => item.quantity <= item.min_threshold).length;
          const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);

          setMetrics({
            totalItems,
            lowStockItems,
            totalValue,
            recentActivity: items.slice(0, 5) // Get 5 most recent items
          });
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          setError('Failed to load dashboard data. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <button
              onClick={() => navigate('/items/new')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add New Item
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Items */}
            <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Items</p>
                  <p className="text-3xl font-bold text-white mt-2">{metrics.totalItems}</p>
                </div>
                <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Low Stock Items */}
            <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Low Stock Items</p>
                  <p className="text-3xl font-bold text-white mt-2">{metrics.lowStockItems}</p>
                </div>
                <div className="p-3 bg-red-500 bg-opacity-20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            {/* Total Inventory Value */}
            <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {formatMoney(metrics.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {metrics.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg hover:bg-opacity-10 transition cursor-pointer"
                  onClick={() => navigate(`/items/${item.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    {item.image_url ? (
                      <img
                        src={`http://localhost:8000${item.image_url}`}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white bg-opacity-10 rounded-lg" />
                    )}
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">Qty: {item.quantity}</p>
                    <p className={`text-sm ${item.quantity <= item.min_threshold ? 'text-red-400' : 'text-green-400'}`}>
                      {item.quantity <= item.min_threshold ? 'Low Stock' : 'In Stock'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
