
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Bold, Italic, AlignLeft, AlignCenter, List, ListOrdered, Heading1, Heading2, Heading3, Link, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useData, CategoryType } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const ArticleEditor: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { articles, authors, addArticle, updateArticle, getArticleById } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('Football');
  const [authorId, setAuthorId] = useState('');
  const [readTime, setReadTime] = useState(5);
  const [featuredImage, setFeaturedImage] = useState('/public/placeholder.svg');
  const [previewHtml, setPreviewHtml] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  
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
        
        // Calculate word count
        calculateWordCount(article.content);
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
    calculateWordCount(content);
  }, [content]);
  
  const calculateWordCount = (text: string) => {
    // Strip HTML tags and count words
    const strippedText = text.replace(/<[^>]*>/g, ' ');
    const words = strippedText.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Estimate read time: average reading speed is about 250 words per minute
    const estimatedReadTime = Math.max(1, Math.ceil(words.length / 250));
    setReadTime(estimatedReadTime);
  };
  
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
  
  const insertFormatting = (format: string) => {
    // This is a simple implementation - in a real app, you would use a proper rich text editor
    let formattedText = '';
    
    switch(format) {
      case 'h1':
        formattedText = `<h1>Heading 1</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>Heading 2</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>Heading 3</h3>`;
        break;
      case 'bold':
        formattedText = `<strong>Bold text</strong>`;
        break;
      case 'italic':
        formattedText = `<em>Italic text</em>`;
        break;
      case 'ul':
        formattedText = `<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>`;
        break;
      case 'ol':
        formattedText = `<ol>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ol>`;
        break;
      case 'link':
        formattedText = `<a href="https://example.com">Link text</a>`;
        break;
      case 'image':
        formattedText = `<img src="/public/placeholder.svg" alt="Image description" class="w-full h-auto">`;
        break;
      default:
        formattedText = '';
    }
    
    setContent(prev => prev + formattedText);
  };

  const handleImageUpload = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        // Set the image preview
        setFeaturedImage(event.target.result as string);
        
        toast({
          title: "Image uploaded",
          description: "Featured image has been updated.",
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
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
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
                  <Label htmlFor="content">Article Content</Label>
                  <div className="border rounded-md mb-2">
                    <div className="flex flex-wrap items-center border-b p-2 gap-2">
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('h1')}>
                        <Heading1 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('h2')}>
                        <Heading2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('h3')}>
                        <Heading3 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')}>
                        <Bold size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')}>
                        <Italic size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('ul')}>
                        <List size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('ol')}>
                        <ListOrdered size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('link')}>
                        <Link size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => insertFormatting('image')}>
                        <Image size={16} />
                      </Button>
                    </div>
                    <Textarea 
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article content here..."
                      rows={15}
                      className="border-none focus-visible:ring-0"
                    />
                    <div className="flex justify-between items-center border-t p-2 text-xs text-gray-500">
                      <div>Word count: {wordCount} / 5000</div>
                      <div>{wordCount < 500 ? 'Very short' : wordCount < 1000 ? 'Short' : wordCount < 2000 ? 'Medium' : 'Long'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {showPreview && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Live Preview</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>Hide Preview</Button>
                  </div>
                  <div className="prose max-w-none border p-4 rounded-md min-h-[300px]" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              )}
              
              {!showPreview && (
                <Button variant="outline" className="w-full" onClick={() => setShowPreview(true)}>
                  <FileText size={16} className="mr-2" />
                  Show Preview
                </Button>
              )}
            </div>
            
            {/* Settings Column */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">Publishing Options</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                    ✓
                  </div>
                  <span>Publish immediately</span>
                </div>
                <Button onClick={handleSave} className="w-full">
                  <Save size={16} className="mr-2" />
                  {isEditMode ? 'Update Article' : 'Publish Article'}
                </Button>
              </div>
            
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
                      src={featuredImage} 
                      alt="Featured preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" className="w-full" onClick={handleImageUpload}>
                    <Upload size={16} className="mr-2" />
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Recommended size: 1200x630 pixels (16:9 ratio)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
