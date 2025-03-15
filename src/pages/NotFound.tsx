
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-red-500">404</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full flex items-center gap-2">
              <Home size={18} />
              Return to Home
            </Button>
          </Link>
          <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
