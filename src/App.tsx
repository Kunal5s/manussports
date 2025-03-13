
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:category" element={<ArticlesPage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/author/:authorId" element={<AuthorProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/articles" element={<AdminArticles />} />
            <Route path="/admin/articles/edit/:articleId" element={<ArticleEditor />} />
            <Route path="/admin/articles/new" element={<ArticleEditor />} />
            <Route path="/admin/wallet" element={<AdminWallet />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/authors" element={<AdminAuthors />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
