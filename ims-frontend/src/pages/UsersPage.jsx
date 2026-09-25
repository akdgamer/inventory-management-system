import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Users, Search, Mail, Shield, Calendar } from 'lucide-react';

export default function UsersPage() {
  const { fetchWithAuth, postWithAuth, patchWithAuth, deleteWithAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', role_id: '' });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/users/');
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await fetchWithAuth('/roles/');
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        email: formData.email,
        role_id: parseInt(formData.role_id)
      };
      
      if (formData.password) {
        submitData.password = formData.password;
      }

      if (editingUser) {
        await patchWithAuth(`/users/${editingUser.id}`, submitData);
      } else {
        await postWithAuth('/users/', submitData);
      }
      fetchUsers();
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', role_id: '' });
    } catch (error) {
      console.error('Failed to save user:', error);
      setError('Failed to save user. Please try again.');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ 
      email: user.email, 
      password: '',
      role_id: user.role_id.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteWithAuth(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role && user.role.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Users</h1>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Users List */}
          <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl overflow-hidden">
            {/* Desktop/Tablet Table View */}
            <div className="hidden sm:block">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white border-opacity-20 bg-white bg-opacity-5">
                <div className="col-span-1 flex items-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div className="col-span-4 text-sm font-medium text-gray-300">Email</div>
                <div className="col-span-2 text-sm font-medium text-gray-300">Role</div>
                <div className="col-span-2 text-sm font-medium text-gray-300">Created</div>
                <div className="col-span-2 text-sm font-medium text-gray-300">Last Login</div>
                <div className="col-span-1 text-sm font-medium text-gray-300">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white divide-opacity-10">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-white hover:bg-opacity-5 transition"
                  >
                    {/* Avatar */}
                    <div className="col-span-1 flex items-center">
                      <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-400" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-4 flex items-center">
                      <span className="text-white font-medium break-all">{user.email}</span>
                    </div>

                    {/* Role */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-purple-400 text-sm">{user.role?.name || 'No Role'}</span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{formatDate(user.created_at)}</span>
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{formatDate(user.last_login)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-white divide-opacity-10">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-white hover:bg-opacity-5 transition"
                >
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm break-all">{user.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Shield className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-400 text-xs">{user.role?.name || 'No Role'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>Created: {formatDate(user.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span>Last Login: {formatDate(user.last_login)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email address"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password {editingUser && <span className="text-gray-400">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
                  minLength={6}
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  required
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id} className="bg-slate-800">
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ email: '', password: '', role_id: '' });
                  }}
                  className="px-4 py-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}