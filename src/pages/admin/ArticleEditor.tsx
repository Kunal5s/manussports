
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, ArrowLeft, Upload, Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Heading1, Heading2, Heading3, Link as LinkIcon, 
  Image, FileText, Video, Type, Underline, Code, Quote, Undo, Redo,
  PaintBucket, AlignJustify, Clipboard, Strikethrough, Superscript, Subscript
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useData, CategoryType } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const ArticleEditor: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { articles, authors, addArticle, updateArticle, getArticleById } = useData();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const contentEditorRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CategoryType>('Football');
  const [authorId, setAuthorId] = useState('');
  const [readTime, setReadTime] = useState(5);
  const [featuredImage, setFeaturedImage] = useState('/public/placeholder.svg');
  const [wordCount, setWordCount] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  
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
        if (contentEditorRef.current) {
          contentEditorRef.current.innerHTML = article.content;
        }
        setCategory(article.category);
        setAuthorId(article.authorId);
        setReadTime(article.readTime);
        setFeaturedImage(article.featuredImage);
        
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
  
  const calculateWordCount = (text: string) => {
    // Strip HTML tags and count words
    const strippedText = text.replace(/<[^>]*>/g, ' ');
    const words = strippedText.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Estimate read time: average reading speed is about 250 words per minute
    const estimatedReadTime = Math.max(1, Math.ceil(words.length / 250));
    setReadTime(estimatedReadTime);
  };
  
  const saveContentState = () => {
    if (contentEditorRef.current) {
      const currentContent = contentEditorRef.current.innerHTML;
      setUndoStack(prev => [...prev, currentContent]);
      setRedoStack([]);
    }
  };
  
  const handleContentChange = () => {
    if (contentEditorRef.current) {
      const html = contentEditorRef.current.innerHTML;
      setContent(html);
      calculateWordCount(html);
    }
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
  
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prevContent = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      
      if (contentEditorRef.current) {
        setRedoStack(prev => [...prev, contentEditorRef.current.innerHTML]);
        contentEditorRef.current.innerHTML = prevContent;
        handleContentChange();
      }
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextContent = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      
      if (contentEditorRef.current) {
        setUndoStack(prev => [...prev, contentEditorRef.current.innerHTML]);
        contentEditorRef.current.innerHTML = nextContent;
        handleContentChange();
      }
    }
  };
  
  const insertFormatting = (format: string) => {
    if (!contentEditorRef.current) return;
    
    saveContentState();
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    
    switch(format) {
      case 'h1':
        document.execCommand('formatBlock', false, 'h1');
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, 'h3');
        break;
      case 'p':
        document.execCommand('formatBlock', false, 'p');
        break;
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'ul':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'ol':
        document.execCommand('insertOrderedList', false);
        break;
      case 'alignLeft':
        document.execCommand('justifyLeft', false);
        break;
      case 'alignCenter':
        document.execCommand('justifyCenter', false);
        break;
      case 'alignRight':
        document.execCommand('justifyRight', false);
        break;
      case 'alignJustify':
        document.execCommand('justifyFull', false);
        break;
      case 'indent':
        document.execCommand('indent', false);
        break;
      case 'outdent':
        document.execCommand('outdent', false);
        break;
      case 'superscript':
        document.execCommand('superscript', false);
        break;
      case 'subscript':
        document.execCommand('subscript', false);
        break;
      case 'quote':
        document.execCommand('formatBlock', false, 'blockquote');
        break;
      case 'code':
        document.execCommand('formatBlock', false, 'pre');
        const pre = document.createElement('code');
        if (range.collapsed) {
          pre.textContent = 'code';
          range.insertNode(pre);
        } else {
          const content = range.extractContents();
          pre.appendChild(content);
          range.insertNode(pre);
        }
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
      case 'image':
        if (fileInputRef.current) fileInputRef.current.click();
        break;
      case 'video':
        if (videoInputRef.current) videoInputRef.current.click();
        break;
      case 'fontSize':
        document.execCommand('fontSize', false, '3'); // Default size
        if (selection && !selection.isCollapsed) {
          const span = document.createElement('span');
          span.style.fontSize = `${fontSize}px`;
          
          const range = selection.getRangeAt(0);
          const content = range.extractContents();
          span.appendChild(content);
          range.insertNode(span);
        }
        break;
      case 'textColor':
        document.execCommand('foreColor', false, textColor);
        break;
      case 'backgroundColor':
        document.execCommand('hiliteColor', false, backgroundColor);
        break;
      default:
        break;
    }
    
    handleContentChange();
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

  const handleContentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    saveContentState();
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result && contentEditorRef.current) {
        // Insert image at current selection position
        const imageUrl = event.target.result as string;
        document.execCommand('insertHTML', false, `<img src="${imageUrl}" alt="Article image" class="w-full h-auto my-2" />`);
        handleContentChange();
        
        toast({
          title: "Image inserted",
          description: "Image has been added to the article.",
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
  
  const handleContentVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    saveContentState();
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result && contentEditorRef.current) {
        // Insert video at current selection position
        const videoUrl = event.target.result as string;
        document.execCommand('insertHTML', false, `
          <video controls class="w-full h-auto my-2">
            <source src="${videoUrl}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
        `);
        handleContentChange();
        
        toast({
          title: "Video inserted",
          description: "Video has been added to the article.",
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your video.",
        variant: "destructive",
      });
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  };
  
  const applyFormatting = (command: string, value?: string) => {
    saveContentState();
    document.execCommand(command, false, value);
    handleContentChange();
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
                  <Tabs defaultValue="write" className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="write">Write</TabsTrigger>
                      <TabsTrigger value="format">Format</TabsTrigger>
                      <TabsTrigger value="insert">Insert</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="write">
                      <div className="flex flex-wrap items-center border-b p-2 gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('h1')}>
                                <Heading1 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 1</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('h2')}>
                                <Heading2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 2</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('h3')}>
                                <Heading3 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 3</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('p')}>
                                <Type size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Paragraph</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('bold')}>
                                <Bold size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Bold</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('italic')}>
                                <Italic size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Italic</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('underline')}>
                                <Underline size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Underline</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('link')}>
                                <LinkIcon size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insert Link</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="format">
                      <div className="flex flex-wrap items-center border-b p-2 gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('ul')}>
                                <List size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Bullet List</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('ol')}>
                                <ListOrdered size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Numbered List</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('alignLeft')}>
                                <AlignLeft size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Align Left</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('alignCenter')}>
                                <AlignCenter size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Align Center</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('alignRight')}>
                                <AlignRight size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Align Right</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('alignJustify')}>
                                <AlignJustify size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Justify</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('quote')}>
                                <Quote size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Quote</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('code')}>
                                <Code size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Code</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="insert">
                      <div className="flex flex-wrap items-center border-b p-2 gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('image')}>
                                <Image size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insert Image</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('video')}>
                                <Video size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Insert Video</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('strikethrough')}>
                                <Strikethrough size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Strikethrough</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('superscript')}>
                                <Superscript size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Superscript</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => insertFormatting('subscript')}>
                                <Subscript size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Subscript</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="advanced">
                      <div className="flex flex-wrap items-center border-b p-2 gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={handleUndo}>
                                <Undo size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Undo</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={handleRedo}>
                                <Redo size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Redo</TooltipContent>
                          </Tooltip>
                          
                          <div className="flex items-center space-x-2">
                            <Label>Font Size:</Label>
                            <div className="w-28">
                              <Slider
                                value={[fontSize]}
                                min={8}
                                max={36}
                                step={1}
                                onValueChange={(value) => setFontSize(value[0])}
                                onValueCommit={() => insertFormatting('fontSize')}
                              />
                            </div>
                            <span>{fontSize}px</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label>Text Color:</Label>
                            <input 
                              type="color" 
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              onBlur={() => insertFormatting('textColor')}
                              className="cursor-pointer"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label>Background:</Label>
                            <input 
                              type="color" 
                              value={backgroundColor}
                              onChange={(e) => setBackgroundColor(e.target.value)}
                              onBlur={() => insertFormatting('backgroundColor')}
                              className="cursor-pointer"
                            />
                          </div>
                        </TooltipProvider>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleContentImageUpload}
                    accept="image/*"
                  />
                  
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={videoInputRef}
                    onChange={handleContentVideoUpload}
                    accept="video/*"
                  />
                  
                  <div 
                    ref={contentEditorRef}
                    className="p-3 min-h-[300px] focus:outline-none prose max-w-none border rounded-md"
                    contentEditable
                    onInput={handleContentChange}
                    onBlur={handleContentChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveContentState();
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                  
                  <div className="flex justify-between items-center p-2 text-xs text-gray-500">
                    <div>Word count: {wordCount} / 5000</div>
                    <div>{wordCount < 500 ? 'Very short' : wordCount < 1000 ? 'Short' : wordCount < 2000 ? 'Medium' : 'Long'}</div>
                  </div>
                </div>
              </div>
              
              {showPreview && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Live Preview</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>Hide Preview</Button>
                  </div>
                  <div className="prose max-w-none border p-4 rounded-md min-h-[300px]" dangerouslySetInnerHTML={{ __html: content }} />
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
