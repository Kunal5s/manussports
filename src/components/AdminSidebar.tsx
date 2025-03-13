
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, BarChart3, Wallet, Users, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData } from '@/contexts/DataContext';

const AdminSidebarContent: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { walletBalance } = useData();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Articles', path: '/admin/articles' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Wallet, label: 'Wallet', path: '/admin/wallet' },
    { icon: Users, label: 'Authors', path: '/admin/authors' },
  ];
  
  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Wallet Balance</span>
          <span className="text-lg font-bold">${walletBalance.toFixed(2)}</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-200 text-black'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-black'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          className="flex items-center space-x-3 p-3 rounded-md w-full text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const AdminSidebar: React.FC = () => {
  return (
    <DataProvider>
      <AdminSidebarContent />
    </DataProvider>
  );
};

export default AdminSidebar;
