
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-4">Manus Sports</h3>
            <p className="text-gray-300 mb-4">
              The premier destination for insightful sports analysis and stories.
            </p>
            <div className="flex space-x-4">
              <Twitter className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              <Facebook className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
              <Youtube className="h-5 w-5 text-gray-300 hover:text-white cursor-pointer" />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/articles/Football" className="text-gray-300 hover:text-white">Football</Link></li>
              <li><Link to="/articles/Basketball" className="text-gray-300 hover:text-white">Basketball</Link></li>
              <li><Link to="/articles/Cricket" className="text-gray-300 hover:text-white">Cricket</Link></li>
              <li><Link to="/articles/Tennis" className="text-gray-300 hover:text-white">Tennis</Link></li>
              <li><Link to="/articles/Athletics" className="text-gray-300 hover:text-white">Athletics</Link></li>
              <li><Link to="/articles/Formula 1" className="text-gray-300 hover:text-white">Formula 1</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              <li><Link to="#" className="text-gray-300 hover:text-white">Writer Guidelines</Link></li>
              <li><Link to="#" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="#" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Subscribe</h4>
            <p className="text-gray-300 mb-4">Get the latest sports news and updates.</p>
            <div className="flex flex-col space-y-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-800 border-gray-700 focus:border-white text-white"
              />
              <Button className="bg-white text-gray-900 hover:bg-gray-200">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Manus Sports. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
