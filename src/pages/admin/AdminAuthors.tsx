
import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for authors
const authorsMockData = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    avatar: '/placeholder.svg',
    bio: 'Sports journalist with over 10 years of experience covering football and basketball.',
    articles: 12,
    views: 24680,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: '/placeholder.svg',
    bio: 'Cricket enthusiast and analyst. Former player turned writer.',
    articles: 8,
    views: 15420,
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael@example.com',
    avatar: '/placeholder.svg',
    bio: 'Formula 1 expert with inside access to teams and drivers.',
    articles: 15,
    views: 32150,
  },
];

const AdminAuthors: React.FC = () => {
  const [authors, setAuthors] = useState(authorsMockData);
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    email: '',
    bio: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAuthor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAuthor = () => {
    const author = {
      id: authors.length + 1,
      ...newAuthor,
      avatar: '/placeholder.svg',
      articles: 0,
      views: 0,
    };
    
    setAuthors([...authors, author]);
    setNewAuthor({ name: '', email: '', bio: '' });
    setIsAddAuthorOpen(false);
  };

  const handleDeleteAuthor = (id: number) => {
    setAuthors(authors.filter(author => author.id !== id));
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    name="name"
                    value={newAuthor.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter author name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    name="email"
                    value={newAuthor.email}
                    onChange={handleInputChange}
                    type="email"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter author email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    name="bio"
                    value={newAuthor.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((author) => (
            <Card key={author.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={author.avatar} alt={author.name} />
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
                      <p className="font-medium">{author.articles}</p>
                      <p className="text-gray-500">Articles</p>
                    </div>
                    <div>
                      <p className="font-medium">{author.views.toLocaleString()}</p>
                      <p className="text-gray-500">Total Views</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
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
