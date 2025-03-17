import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAuthors from "./pages/admin/AdminAuthors";
import ArticleEditor from "./pages/admin/ArticleEditor";
import AuthorProfile from "./pages/AuthorProfile";
import NotFound from "./pages/NotFound";
import ArticlePage from "./pages/ArticlePage";
import WriterGuidelinesPage from "./pages/WriterGuidelinesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { useXataStorage } from "./hooks/use-xata-storage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Component to handle initial data loading
const DataInitializer = ({ children }: { children: React.ReactNode }) => {
  const { syncFromXata } = useXataStorage();
  const [initialized, setInitialized] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadArticles = async () => {
      try {
        // Check if articles already exist in localStorage
        const articlesInStorage = localStorage.getItem('manusSportsArticles');
        
        // Always try to sync from database first
        await syncFromXata();
        setInitialized(true);
      } catch (err) {
        console.error("Failed to sync articles:", err);
        setSyncError("Could not connect to database. Using local storage only.");
        setInitialized(true);
      }
    };
    
    loadArticles();
  }, [syncFromXata]);
  
  // Show loading if not initialized
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-4">Loading Manus Sports...</h2>
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading articles from database...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {syncError && (
        <div className="bg-amber-50 text-amber-800 p-2 text-sm text-center">
          {syncError} <button className="font-medium underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <DataInitializer>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:category" element={<ArticlesPage />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/author/:authorId" element={<AuthorProfile />} />
                <Route path="/writer-guidelines" element={<WriterGuidelinesPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/articles" element={<AdminArticles />} />
                <Route path="/admin/articles/edit/:articleId" element={<ArticleEditor />} />
                <Route path="/admin/articles/new" element={<ArticleEditor />} />
                <Route path="/admin/wallet" element={<AdminWallet />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/authors" element={<AdminAuthors />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DataInitializer>
          </TooltipProvider>
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
