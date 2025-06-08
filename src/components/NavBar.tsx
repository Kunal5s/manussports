
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavBar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            Manus Sports
          </Link>
          <nav className="flex space-x-6">
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
        </div>
      </div>
    </header>
  );
};

export default NavBar;
