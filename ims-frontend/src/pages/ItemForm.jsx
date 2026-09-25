import React, { useState, useEffect } from 'react';
import { Package, Plus, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

export default function ItemForm() {
  const { postWithAuth, putWithAuth, fetchWithAuth, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    sku: '', name: '', description: '',
    quantity: 0, min_threshold: 0,
    category_id: '', supplier_id: '',
    image: ''
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      if (!isLoading && isAuthenticated && isEdit) {
        try {
          const data = await fetchWithAuth(`/items/${id}`);
          setForm({
            sku: data.sku,
            name: data.name,
            description: data.description || '',
            quantity: data.quantity,
            min_threshold: data.min_threshold,
            category_id: data.category?.id || '',
            supplier_id: data.supplier?.id || '',
            image: data.image || ''
          });
          setPreviewUrl(data.image_url || '');
        } catch (error) {
          console.error('Failed to load item:', error);
          setError('Failed to load item');
        }
      }
    };

    fetchItem();
  }, [id, isEdit, isAuthenticated, isLoading]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFile = async e => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
      setPreviewUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        console.log('Base64 string length:', base64String.length);
        setForm(f => ({ ...f, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isAuthenticated) {
      console.error('Form submission attempted while not authenticated');
      setError('Not authenticated. Please log in again.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const url = isEdit ? `/items/${id}` : '/items';
      console.log('Submitting form to:', url);

      // Create a copy of the form data without empty values
      const formData = Object.entries(form).reduce((acc, [key, value]) => {
        // Only include non-empty values
        if (value !== '' && value !== null && value !== undefined) {
          // Convert numeric fields
          if (key === 'quantity' || key === 'min_threshold') {
            acc[key] = parseInt(value, 10);
          } else {
            acc[key] = value;
          }
        }
        return acc;
      }, {});

      console.log('Form data to be sent:', {
        ...formData,
        image: formData.image ? `Base64 image data (${formData.image.length} chars)` : 'No image'
      });

      // Use putWithAuth for updates and postWithAuth for new items
      const response = isEdit 
        ? await putWithAuth(url, formData)
        : await postWithAuth(url, formData);

      console.log('Form submission successful:', response);
      console.log('Image URL from response:', response.image_url);

      // If we get here, the request was successful
      navigate('/items');
    } catch (error) {
      console.error('Failed to save item:', error);
      if (error.message === 'Authentication failed') {
        console.error('Authentication failed during form submission');
        setError('Your session has expired. Please log in again.');
      } else {
        console.error('Other error during form submission:', error);
        setError(error.message || 'Failed to save item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">
            {isEdit ? 'Edit Item' : 'New Item'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Quantity and Min Threshold */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Min Threshold
                </label>
                <input
                  type="number"
                  name="min_threshold"
                  value={form.min_threshold}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white cursor-pointer hover:bg-opacity-20 transition"
                >
                  Choose Image
                </label>
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-white border-opacity-20"
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Item' : 'Create Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}