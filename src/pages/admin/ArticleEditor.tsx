
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { DataProvider, useData, CategoryType } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const ArticleEditorContent: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { articles, authors, addArticle, updateArticle, getArticleById } = useData();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('Football');
  const [authorId, setAuthorId] = useState('');
  const [readTime, setReadTime] = useState(5);
  const [featuredImage, setFeaturedImage] = useState('/public/placeholder.svg');
  const [previewHtml, setPreviewHtml] = useState('');
  
  const isEditMode = !!articleId;
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    if (isEditMode && articleId) {
      const article = getArticleById(articleId);
      if (article) {
        setTitle(article.title);
        setSummary(article.summary);
        setContent(article.content);
        setCategory(article.category);
        setAuthorId(article.authorId);
        setReadTime(article.readTime);
        setFeaturedImage(article.featuredImage);
        setPreviewHtml(article.content);
      } else {
        toast({
          title: "Article not found",
          description: "The article you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate('/admin/articles');
      }
    } else {
      // Default author for new articles
      if (authors.length > 0) {
        setAuthorId(authors[0].id);
      }
    }
  }, [isEditMode, articleId, getArticleById, navigate, authors, toast]);
  
  // Update preview when content changes
  useEffect(() => {
    setPreviewHtml(content);
  }, [content]);
  
  const handleSave = () => {
    // Validate fields
    if (!title || !summary || !content || !category || !authorId) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    const articleData = {
      title,
      summary,
      content,
      category,
      authorId,
      readTime,
      featuredImage,
    };
    
    if (isEditMode && articleId) {
      const existingArticle = getArticleById(articleId);
      if (existingArticle) {
        updateArticle({
          ...existingArticle,
          ...articleData,
        });
        toast({
          title: "Article updated",
          description: "Your changes have been saved.",
        });
      }
    } else {
      addArticle(articleData);
      toast({
        title: "Article created",
        description: "Your new article has been published.",
      });
    }
    
    navigate('/admin/articles');
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Estimate read time: average reading speed is about 250 words per minute
    const wordCount = e.target.value.split(/\s+/).filter(Boolean).length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 250));
    setReadTime(estimatedReadTime);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => navigate('/admin/articles')} className="mr-4">
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Article' : 'Create New Article'}</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-4">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Article title"
                    className="text-lg font-bold"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea 
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief summary of the article"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content (HTML)</Label>
                  <Textarea 
                    id="content"
                    value={content}
                    onChange={handleContentChange}
                    placeholder="<h1>Article Title</h1><p>Your content here...</p>"
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use HTML tags for formatting: &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, etc.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Content Preview</h3>
                <div className="prose max-w-none border p-4 rounded-md min-h-[300px]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
            
            {/* Settings Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Article Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={category} 
                      onValueChange={(value) => setCategory(value as CategoryType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Athletics">Athletics</SelectItem>
                        <SelectItem value="Formula 1">Formula 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Select 
                      value={authorId} 
                      onValueChange={setAuthorId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map(author => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="readTime">Read Time (minutes)</Label>
                    <Input 
                      id="readTime"
                      type="number"
                      min="1"
                      value={readTime}
                      onChange={(e) => setReadTime(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Featured Image</h3>
                
                <div className="mb-4">
                  <div className="border rounded-md overflow-hidden h-48">
                    <img 
                      src={featuredImage || '/public/placeholder.svg'} 
                      alt="Featured preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" className="w-full">
                    <Upload size={16} className="mr-2" />
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Recommended ratio: 16:9
                </p>
              </div>
              
              <Button onClick={handleSave} className="w-full">
                <Save size={16} className="mr-2" />
                {isEditMode ? 'Update Article' : 'Publish Article'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArticleEditor: React.FC = () => {
  return (
    <DataProvider>
      <ArticleEditorContent />
    </DataProvider>
  );
};

export default ArticleEditor;
