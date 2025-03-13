
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

type User = {
  email: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('manusSportsUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Redirect to admin dashboard if user is on login page but already authenticated
        if (location.pathname === '/login') {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('manusSportsUser');
      }
    } else if (location.pathname.includes('/admin') && !isAuthenticated) {
      // Redirect to login if trying to access admin pages without authentication
      navigate('/login');
    }
  }, [location.pathname, navigate, isAuthenticated]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check if the credentials match the admin credentials
    if (email === 'kunalsonpitre555@yahoo.com' && password === 'Kunal@#&555KL') {
      const userData = {
        email,
        isAdmin: true,
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('manusSportsUser', JSON.stringify(userData));
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard!",
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('manusSportsUser');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
