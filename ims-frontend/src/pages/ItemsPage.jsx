import React, { useEffect, useState } from "react";
import { Package, Search, Plus, Eye, X, Minus, Plus as PlusIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import StockTransactionForm from "../components/StockTransactionForm";

export default function ItemsPage() {
  const { fetchWithAuth, postWithAuth, putWithAuth, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // Fetch items
  const fetchItems = async () => {
    if (!isLoading && isAuthenticated) {
      try {
        setLoading(true);
        const data = await fetchWithAuth(`/items/?search=${search}`);
        setItems(data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchItems();
  }, [isAuthenticated, isLoading, search]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  // For creating/updating items
  const handleSubmit = async (itemData) => {
    try {
      if (itemData.id) {
        // Update existing item
        await putWithAuth(`/items/${itemData.id}`, itemData);
      } else {
        // Create new item
        await postWithAuth('/items/', itemData);
      }
      // Refresh items list
      const data = await fetchWithAuth('/items/');
      setItems(data);
    } catch (error) {
      console.error("Failed to save item:", error);
      setError("Failed to save item. Please try again.");
    }
  };

  // For deleting items
  const handleDelete = async (itemId) => {
    try {
      await fetchWithAuth(`/items/${itemId}`, {
        method: 'DELETE'
      });
      // Remove item from state
      setItems(items.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Failed to delete item:", error);
      setError("Failed to delete item. Please try again.");
    }
  };

  // Handle stock transaction
  const handleStockTransaction = (item) => {
    setSelectedItem(item);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = async () => {
    // Refresh items list
    try {
      const data = await fetchWithAuth(`/items/?search=${search}`);
      setItems(data);
    } catch (error) {
      console.error("Failed to refresh items:", error);
    }
    setShowTransactionForm(false);
    setSelectedItem(null);
  };

  return (
    <div className="p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Inventory Items</h1>
            <button
              onClick={() => navigate('/items/new')}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Min Threshold</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-700 hover:bg-white hover:bg-opacity-5 transition cursor-pointer"
                    onClick={() => navigate(`/items/${item.id}`)}
                  >
                    <td className="py-4 px-6">
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
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-mono">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 text-white">{item.name}</td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        item.quantity <= item.min_threshold ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {item.min_threshold}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          item.quantity <= item.min_threshold ? "bg-red-500 bg-opacity-20 text-red-400" : "bg-green-500 bg-opacity-20 text-green-400"
                        }`}
                      >
                        {item.quantity <= item.min_threshold ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStockTransaction(item);
                          }}
                          className="p-2 rounded-lg hover:bg-green-500 hover:bg-opacity-20 transition"
                          title="Stock Transaction"
                        >
                          <Package className="w-4 h-4 text-green-400 hover:text-green-300" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/items/${item.id}`);
                          }}
                          className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-300 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={`http://localhost:8000${selectedImage}`}
              alt=""
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Stock Transaction Form Modal */}
      {showTransactionForm && selectedItem && (
        <StockTransactionForm
          item={selectedItem}
          onClose={() => {
            setShowTransactionForm(false);
            setSelectedItem(null);
          }}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}