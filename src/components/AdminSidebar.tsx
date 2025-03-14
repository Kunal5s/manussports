
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, BarChart3, Wallet, Users, Home, LogOut, Globe, ExternalLink, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { walletBalance } = useData();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Articles', path: '/admin/articles' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Wallet, label: 'Wallet', path: '/admin/wallet' },
    { icon: Users, label: 'Authors', path: '/admin/authors' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const sidebarContent = (
    <>
      <div className="p-4 md:p-6 border-b border-gray-200">
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
                onClick={() => isMobile && setIsMenuOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Link back to main website - more prominently displayed */}
        <Link 
          to="/"
          className="flex items-center justify-center space-x-2 p-3 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          onClick={() => isMobile && setIsMenuOpen(false)}
        >
          <Globe size={18} />
          <span>View Website</span>
          <ExternalLink size={14} />
        </Link>
        
        <button 
          className="flex items-center space-x-3 p-3 rounded-md w-full text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
  
  // Mobile view
  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <button 
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Mobile sidebar */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMenu}>
            <div 
              className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }
  
  // Desktop view
  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      {sidebarContent}
    </div>
  );
};

export default AdminSidebar;
