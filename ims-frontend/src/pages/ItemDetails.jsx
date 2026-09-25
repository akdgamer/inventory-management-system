import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Trash2, ArrowLeft, Package, DollarSign, AlertTriangle, Tag, Building, Plus, Minus } from 'lucide-react';
import TransactionHistory from '../components/TransactionHistory';
import StockTransactionForm from '../components/StockTransactionForm';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchWithAuth, deleteWithAuth } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionKey, setTransactionKey] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/items/${id}`);
        setItem(data);
      } catch (error) {
        console.error('Failed to fetch item:', error);
        setError('Failed to load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteWithAuth(`/items/${id}`);
      navigate('/items');
    } catch (error) {
      console.error('Failed to delete item:', error);
      setError('Failed to delete item. Please try again later.');
    }
  };

  const handleTransactionSuccess = async (transaction) => {
    // Refresh item data to show updated quantity
    try {
      const updatedItem = await fetchWithAuth(`/items/${id}`);
      setItem(updatedItem);
      // Force transaction history to refresh
      setTransactionKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!item) {
    return <div className="text-center p-4">Item not found</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/items')}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-2xl font-bold text-white">{item.name}</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowTransactionForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Stock Transaction</span>
              </button>
              <button
                onClick={() => navigate(`/items/${id}/edit`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-6">
              {/* Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-white bg-opacity-5">
                {item.image_url ? (
                  <img
                    src={`http://localhost:8000${item.image_url}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">SKU</p>
                    <p className="text-white">{item.sku}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-white">{item.description || 'No description available'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Stock Information */}
              <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Stock Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Current Quantity</p>
                    <p className="text-white text-2xl font-bold">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Minimum Threshold</p>
                    <p className="text-white text-2xl font-bold">{item.min_threshold}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Unit Price</p>
                    <p className="text-white text-2xl font-bold">${item.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Value</p>
                    <p className="text-white text-2xl font-bold">
                      ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
                {item.quantity <= item.min_threshold && (
                  <div className="mt-4 p-3 bg-red-500 bg-opacity-20 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">Low Stock Alert</p>
                  </div>
                )}
              </div>

              {/* Category and Supplier */}
              <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Category & Supplier</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Tag className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Category</p>
                      <p className="text-white">{item.category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Supplier</p>
                      <p className="text-white">{item.supplier?.name || 'No supplier'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="mt-8 backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
            <TransactionHistory key={transactionKey} itemId={id} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Transaction Form Modal */}
      {showTransactionForm && (
        <StockTransactionForm
          item={item}
          onClose={() => setShowTransactionForm(false)}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
} 