import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Package,
  BarChart3,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Tag,
  Building,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { id: 'dashboard', name: 'Dashboard', to: '/', icon: BarChart3 },
  { id: 'items',     name: 'Items',     to: '/items',     icon: Package },
  { id: 'categories', name: 'Categories', to: '/categories', icon: Tag },
  { id: 'suppliers', name: 'Suppliers', to: '/suppliers', icon: Building },
  { id: 'orders',    name: 'Orders',    to: '/orders',    icon: ShoppingCart },
  { id: 'users',     name: 'Users',     to: '/users',     icon: Users },
  { id: 'roles',     name: 'Roles',     to: '/roles',     icon: Shield },
  { id: 'settings',  name: 'Settings',  to: '/settings',  icon: Settings },
];

export default function Sidebar({ sidebarOpen, sidebarCollapsed, onClose, onToggleCollapse }) {
  const { logout } = useAuth();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
        backdrop-blur-xl bg-white/10 border-r border-white/20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        lg:translate-x-0
        w-64
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-white lg:block hidden">Inventory Hub</span>
            )}
            <span className="text-xl font-bold text-white lg:hidden">Inventory Hub</span>
          </div>
          
          {/* Mobile close button only */}
          <button onClick={onClose} className="lg:hidden p-2 rounded hover:bg-white/10">
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center rounded-xl transition-all duration-200 group relative
                ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
                ${isActive
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'}`
              }
              onClick={onClose}
              title={sidebarCollapsed ? item.name : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="lg:block hidden">{item.name}</span>
              )}
              <span className="lg:hidden">{item.name}</span>
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle - Desktop Only */}
        <div className="hidden lg:block px-4 py-2">
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center rounded-lg transition-all duration-200 group relative py-2
              ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'}
              text-gray-400 hover:bg-white/5 hover:text-gray-300 border border-white/10`}
            title={sidebarCollapsed ? (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : ''}
          >
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Collapse</span>
            )}
            <div className="flex items-center">
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </div>
            
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Expand sidebar
              </div>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => { logout(); }}
            className={`w-full flex items-center rounded-xl transition group relative
              ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              text-gray-300 hover:bg-red-500/20 hover:text-red-400`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="lg:block hidden">Logout</span>
            )}
            <span className="lg:hidden">Logout</span>
            
            {/* Tooltip for collapsed state */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden lg:block">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
