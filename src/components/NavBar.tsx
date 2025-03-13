
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NavBar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            Manus Sports
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className={`hover:text-gray-600 ${
                location.pathname === "/" ? "font-medium" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/articles"
              className={`hover:text-gray-600 ${
                location.pathname === "/articles" ? "font-medium" : ""
              }`}
            >
              Articles
            </Link>
            <Link
              to="/about"
              className={`hover:text-gray-600 ${
                location.pathname === "/about" ? "font-medium" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`hover:text-gray-600 ${
                location.pathname === "/contact" ? "font-medium" : ""
              }`}
            >
              Contact
            </Link>
          </nav>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/admin">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" className="bg-black text-white">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
