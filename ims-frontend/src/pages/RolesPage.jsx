import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react';

export default function RolesPage() {
  const { fetchWithAuth, postWithAuth, putWithAuth, deleteWithAuth, patchWithAuth } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        fetchWithAuth('/roles/'),
        fetchWithAuth('/roles/permissions/all')
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      setError('Failed to load roles and permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const response = await postWithAuth('/roles/', newRole);
      setRoles([...roles, response]);
      setNewRole({ name: '', description: '' });
      setShowCreateRole(false);
    } catch (err) {
      setError('Failed to create role');
      console.error(err);
    }
  };

  const handleUpdateRole = async (roleId, updatedRole) => {
    try {
      const response = await putWithAuth(`/roles/${roleId}`, updatedRole);
      setRoles(roles.map(role => role.id === roleId ? response : role));
      setEditingRole(null);
    } catch (err) {
      setError('Failed to update role');
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await deleteWithAuth(`/roles/${roleId}`);
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (err) {
      setError('Failed to delete role');
      console.error(err);
    }
  };

  const handlePermissionToggle = async (roleId, permissionId, hasPermission) => {
    try {
      const role = roles.find(r => r.id === roleId);
      let newPermissionIds;
      
      if (hasPermission) {
        // Remove permission
        newPermissionIds = role.permissions
          .filter(p => p.id !== permissionId)
          .map(p => p.id);
      } else {
        // Add permission
        newPermissionIds = [...role.permissions.map(p => p.id), permissionId];
      }

      const response = await patchWithAuth(`/roles/${roleId}/permissions`, newPermissionIds);
      setRoles(roles.map(r => r.id === roleId ? response : r));
    } catch (err) {
      setError('Failed to update permissions');
      console.error(err);
    }
  };

  const hasPermission = (role, permissionId) => {
    return role.permissions.some(p => p.id === permissionId);
  };

  const groupPermissions = (permissions) => {
    const groups = {};
    permissions.forEach(permission => {
      const [category] = permission.name.split('.');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const permissionGroups = groupPermissions(permissions);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
            </div>
            <button
              onClick={() => setShowCreateRole(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Role
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Create Role Modal */}
          {showCreateRole && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white bg-opacity-10 backdrop-blur-xl border border-white border-opacity-20 rounded-xl p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-white mb-4">Create New Role</h2>
                <form onSubmit={handleCreateRole} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      className="w-full p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400"
                      placeholder="Enter role name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      className="w-full p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400"
                      placeholder="Enter role description"
                      rows="3"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateRole(false);
                        setNewRole({ name: '', description: '' });
                      }}
                      className="flex-1 px-4 py-2 text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      Create Role
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Roles List */}
          <div className="space-y-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white bg-opacity-5 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-blue-400" />
                    <div>
                      {editingRole === role.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={role.name}
                            id={`role-name-${role.id}`}
                            className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-1 text-white"
                          />
                          <textarea
                            defaultValue={role.description}
                            id={`role-desc-${role.id}`}
                            className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-3 py-1 text-white w-full"
                            rows="2"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                          <p className="text-gray-300 text-sm">{role.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {editingRole === role.id ? (
                      <>
                        <button
                          onClick={() => {
                            const name = document.getElementById(`role-name-${role.id}`).value;
                            const description = document.getElementById(`role-desc-${role.id}`).value;
                            handleUpdateRole(role.id, { name, description });
                          }}
                          className="p-2 text-green-400 hover:bg-green-500 hover:bg-opacity-20 rounded-lg transition"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="p-2 text-gray-400 hover:bg-gray-500 hover:bg-opacity-20 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingRole(role.id)}
                          className="p-2 text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="p-2 text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-200">Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(permissionGroups).map(([category, categoryPermissions]) => (
                      <div key={category} className="bg-white bg-opacity-5 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-white mb-3 capitalize">
                          {category}
                        </h5>
                        <div className="space-y-2">
                          {categoryPermissions.map((permission) => {
                            const roleHasPermission = hasPermission(role, permission.id);
                            return (
                              <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roleHasPermission}
                                  onChange={() => handlePermissionToggle(role.id, permission.id, roleHasPermission)}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-300">
                                  {permission.description}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}