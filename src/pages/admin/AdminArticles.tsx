
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Pencil, Trash2, Search, Save, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { useGitHubStorage } from '@/hooks/use-github-storage';

const AdminArticles: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { articles, authors, deleteArticle } = useData();
  const { toast } = useToast();
  const { saveToGitHub, syncFromGitHub, isSyncing } = useGitHubStorage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteClick = (articleId: string) => {
    setArticleToDelete(articleId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (articleToDelete) {
      deleteArticle(articleToDelete);
      
      // Also delete from GitHub
      try {
        await saveToGitHub(articles.filter(a => a.id !== articleToDelete));
        toast({
          title: "Article deleted",
          description: "The article has been permanently deleted from local storage and GitHub.",
        });
      } catch (error) {
        console.error("Error deleting article from GitHub:", error);
        toast({
          title: "Partial deletion",
          description: "Article deleted locally but failed to update GitHub. Changes will sync on next backup.",
          variant: "destructive",
        });
      }
      
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };
  
  const handleSyncWithGitHub = async () => {
    try {
      await syncFromGitHub();
      toast({
        title: "Sync successful",
        description: "Articles have been synchronized with GitHub repository.",
      });
      setSyncDialogOpen(false);
    } catch (error) {
      console.error("Error syncing with GitHub:", error);
      toast({
        title: "Sync failed",
        description: "Failed to sync articles with GitHub. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleBackupToGitHub = async () => {
    try {
      await saveToGitHub(articles);
      toast({
        title: "Backup successful",
        description: "All articles have been backed up to GitHub repository.",
      });
    } catch (error) {
      console.error("Error backing up to GitHub:", error);
      toast({
        title: "Backup failed",
        description: "Failed to backup articles to GitHub. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getAuthorName = (authorId: string) => {
    const author = authors.find(a => a.id === authorId);
    return author ? author.name : 'Unknown';
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Manage Articles</h1>
            <div className="flex gap-2">
              <Button onClick={() => setSyncDialogOpen(true)} variant="outline">
                <Github size={18} className="mr-2" />
                Sync with GitHub
              </Button>
              <Button onClick={handleBackupToGitHub} variant="outline">
                <Save size={18} className="mr-2" />
                Backup to GitHub
              </Button>
              <Button onClick={() => navigate('/admin/articles/new')}>
                <PlusCircle size={18} className="mr-2" />
                New Article
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Read Time</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map(article => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.category}</TableCell>
                        <TableCell>{getAuthorName(article.authorId)}</TableCell>
                        <TableCell>
                          {new Date(article.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{article.readTime} min</TableCell>
                        <TableCell>{article.views.total}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteClick(article.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No articles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the article
              and remove its data from our servers and GitHub repository.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* GitHub Sync Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync with GitHub</DialogTitle>
            <DialogDescription>
              This will fetch the latest articles from your GitHub repository and merge them with your local articles.
              Any conflicting articles will be resolved by keeping the GitHub version.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <p className="text-amber-600 font-medium flex items-center">
              <span className="mr-2">⚠️</span>
              This operation will overwrite any local changes that haven't been backed up.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSyncWithGitHub} disabled={isSyncing}>
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminArticles;
