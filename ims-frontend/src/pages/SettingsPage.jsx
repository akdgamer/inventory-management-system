import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, Lock, Bell, Database, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    emailNotifications: false,
    systemUpdates: true
  });
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveNotifications = () => {
    // TODO: Implement notification preferences API call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Database },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-xl bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <Settings className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Settings</h1>
          </div>

          {/* Save Success Message */}
          {saved && (
            <div className="mb-6 p-3 bg-green-500 bg-opacity-20 rounded-lg text-green-400 flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="backdrop-blur-xl bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl p-6">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div className="border-t border-white border-opacity-20 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                value={profileData.currentPassword}
                                onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 pr-12 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              New Password
                            </label>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type={showPassword ? "text" : "password"}
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                              className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Low Stock Alerts</h3>
                          <p className="text-gray-400 text-sm">Get notified when items are running low</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.lowStockAlerts}
                            onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Email Notifications</h3>
                          <p className="text-gray-400 text-sm">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.emailNotifications}
                            onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">System Updates</h3>
                          <p className="text-gray-400 text-sm">Get notified about system updates and maintenance</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.systemUpdates}
                            onChange={(e) => setNotifications({ ...notifications, systemUpdates: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveNotifications}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Preferences</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Tab */}
                {activeTab === 'system' && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">System Information</h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                          <h3 className="text-white font-medium mb-2">Application Version</h3>
                          <p className="text-gray-400">v1.0.0</p>
                        </div>
                        <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                          <h3 className="text-white font-medium mb-2">Database Status</h3>
                          <p className="text-green-400">Connected</p>
                        </div>
                        <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                          <h3 className="text-white font-medium mb-2">Last Backup</h3>
                          <p className="text-gray-400">Today, 3:00 AM</p>
                        </div>
                        <div className="p-4 bg-white bg-opacity-5 rounded-lg">
                          <h3 className="text-white font-medium mb-2">Storage Used</h3>
                          <p className="text-gray-400">2.4 GB / 10 GB</p>
                        </div>
                      </div>

                      <div className="border-t border-white border-opacity-20 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
                        <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-lg">
                          <h4 className="text-red-400 font-medium mb-2">Export Data</h4>
                          <p className="text-gray-400 text-sm mb-4">Download all your data in JSON format</p>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                            Export Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}