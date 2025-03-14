
import React, { useState, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';

const AdminAuthors: React.FC = () => {
  const { authors, addAuthor, updateAuthor, deleteAuthor } = useData();
  const { toast } = useToast();
  
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [isEditAuthorOpen, setIsEditAuthorOpen] = useState(false);
  
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '/public/placeholder.svg',
  });
  
  const [editingAuthor, setEditingAuthor] = useState({
    id: '',
    name: '',
    email: '',
    bio: '',
    profileImage: '',
    articles: [] as string[]
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAuthor(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingAuthor(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleEditProfileImageUpload = () => {
    if (editFileInputRef.current) {
      editFileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result as string;
        if (isEdit) {
          setEditingAuthor(prev => ({ ...prev, profileImage: imageUrl }));
        } else {
          setNewAuthor(prev => ({ ...prev, profileImage: imageUrl }));
        }
        
        toast({
          title: "Image uploaded",
          description: "Profile image has been updated.",
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleAddAuthor = () => {
    if (!newAuthor.name || !newAuthor.email) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and email for the author.",
        variant: "destructive",
      });
      return;
    }
    
    addAuthor({
      ...newAuthor,
      articles: []
    });
    
    toast({
      title: "Author added",
      description: `${newAuthor.name} has been added successfully.`,
    });
    
    setNewAuthor({
      name: '',
      email: '',
      bio: '',
      profileImage: '/public/placeholder.svg',
    });
    
    setIsAddAuthorOpen(false);
  };
  
  const handleEditAuthor = (author: typeof editingAuthor) => {
    setEditingAuthor(author);
    setIsEditAuthorOpen(true);
  };
  
  const handleUpdateAuthor = () => {
    if (!editingAuthor.name || !editingAuthor.email) {
      toast({
        title: "Missing information",
        description: "Please provide at least a name and email for the author.",
        variant: "destructive",
      });
      return;
    }
    
    updateAuthor(editingAuthor);
    
    toast({
      title: "Author updated",
      description: `${editingAuthor.name}'s information has been updated.`,
    });
    
    setIsEditAuthorOpen(false);
  };
  
  const handleDeleteAuthor = (id: string) => {
    deleteAuthor(id);
    
    toast({
      title: "Author deleted",
      description: "The author has been removed successfully.",
    });
  };
  
  const getArticleCount = (authorId: string) => {
    return authors.find(a => a.id === authorId)?.articles.length || 0;
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Authors</h1>
          <Dialog open={isAddAuthorOpen} onOpenChange={setIsAddAuthorOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Author
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Author</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new author to your platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={newAuthor.profileImage} alt="Profile" />
                      <AvatarFallback>{newAuthor.name ? newAuthor.name.charAt(0) : "A"}</AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 rounded-full p-1"
                      onClick={handleProfileImageUpload}
                    >
                      <Upload size={16} />
                    </Button>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e)}
                    accept="image/*"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newAuthor.name}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={newAuthor.email}
                    onChange={handleInputChange}
                    type="email"
                    placeholder="Enter author email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={newAuthor.bio}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter author bio"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddAuthorOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAuthor}>
                  Add Author
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Dialog open={isEditAuthorOpen} onOpenChange={setIsEditAuthorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Author</DialogTitle>
              <DialogDescription>
                Update author information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={editingAuthor.profileImage} alt="Profile" />
                    <AvatarFallback>{editingAuthor.name ? editingAuthor.name.charAt(0) : "A"}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 rounded-full p-1"
                    onClick={handleEditProfileImageUpload}
                  >
                    <Upload size={16} />
                  </Button>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={editFileInputRef}
                  onChange={(e) => handleFileChange(e, true)}
                  accept="image/*"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingAuthor.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter author name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  value={editingAuthor.email}
                  onChange={handleEditInputChange}
                  type="email"
                  placeholder="Enter author email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  name="bio"
                  value={editingAuthor.bio}
                  onChange={handleEditInputChange}
                  rows={3}
                  placeholder="Enter author bio"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAuthorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAuthor}>
                Update Author
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <Card key={author.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={author.profileImage} alt={author.name} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{author.name}</CardTitle>
                  <CardDescription>{author.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{author.bio}</p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{getArticleCount(author.id)}</p>
                      <p className="text-gray-500">Articles</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditAuthor(author)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAuthor(author.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAuthors;
