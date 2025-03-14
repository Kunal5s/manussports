
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type CategoryType = 'Football' | 'Basketball' | 'Cricket' | 'Tennis' | 'Athletics' | 'Formula 1';

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: CategoryType;
  authorId: string;
  featuredImage: string;
  publishedDate: string;
  readTime: number;
  views: {
    total: number;
    daily: number[];
    weekly: number[];
    monthly: number[];
    sixMonths: number[];
    yearly: number[];
  };
}

export interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  profileImage: string;
  articles: string[]; // Article IDs
}

export interface Earnings {
  id: string;
  articleId: string;
  date: string;
  amount: number;
  viewerIp?: string; // To track unique viewers
}

export interface Withdrawal {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed';
}

interface DataContextType {
  articles: Article[];
  authors: Author[];
  earnings: Earnings[];
  withdrawals: Withdrawal[];
  paypalEmail: string;
  walletBalance: number;
  addArticle: (article: Omit<Article, 'id' | 'publishedDate' | 'views'>) => void;
  updateArticle: (article: Article) => void;
  deleteArticle: (id: string) => void;
  getArticleById: (id: string) => Article | undefined;
  addAuthor: (author: Omit<Author, 'id'>) => void;
  updateAuthor: (author: Author) => void;
  deleteAuthor: (id: string) => void;
  getAuthorById: (id: string) => Author | undefined;
  updatePaypalEmail: (email: string) => void;
  requestWithdrawal: (amount: number) => void;
  recordEarnings: (articleId: string, amount: number, viewerIp?: string) => void;
  addArticleView: (articleId: string) => void;
  getArticlesByCategory: (category: CategoryType) => Article[];
}

// Initial authors
const initialAuthors: Author[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'kunalsonpitre555@yahoo.com',
    bio: 'Sports journalist and analyst with over 10 years of experience covering major sporting events worldwide.',
    profileImage: '/public/placeholder.svg',
    articles: []
  }
];

// Empty initial data
const initialArticles: Article[] = [];
const initialEarnings: Earnings[] = [];
const initialWithdrawals: Withdrawal[] = [];

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(() => {
    const storedArticles = localStorage.getItem('manusSportsArticles');
    return storedArticles ? JSON.parse(storedArticles) : initialArticles;
  });
  
  const [authors, setAuthors] = useState<Author[]>(() => {
    const storedAuthors = localStorage.getItem('manusSportsAuthors');
    return storedAuthors ? JSON.parse(storedAuthors) : initialAuthors;
  });
  
  const [earnings, setEarnings] = useState<Earnings[]>(() => {
    const storedEarnings = localStorage.getItem('manusSportsEarnings');
    return storedEarnings ? JSON.parse(storedEarnings) : initialEarnings;
  });
  
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() => {
    const storedWithdrawals = localStorage.getItem('manusSportsWithdrawals');
    return storedWithdrawals ? JSON.parse(storedWithdrawals) : initialWithdrawals;
  });
  
  const [paypalEmail, setPaypalEmail] = useState<string>(() => {
    const storedEmail = localStorage.getItem('manusSportsPaypalEmail');
    return storedEmail || 'kunalsonpitre555@yahoo.com';
  });
  
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const storedBalance = localStorage.getItem('manusSportsWalletBalance');
    return storedBalance ? parseFloat(storedBalance) : 0;
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('manusSportsArticles', JSON.stringify(articles));
  }, [articles]);
  
  useEffect(() => {
    localStorage.setItem('manusSportsAuthors', JSON.stringify(authors));
  }, [authors]);
  
  useEffect(() => {
    localStorage.setItem('manusSportsEarnings', JSON.stringify(earnings));
  }, [earnings]);
  
  useEffect(() => {
    localStorage.setItem('manusSportsWithdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);
  
  useEffect(() => {
    localStorage.setItem('manusSportsPaypalEmail', paypalEmail);
  }, [paypalEmail]);
  
  useEffect(() => {
    localStorage.setItem('manusSportsWalletBalance', walletBalance.toString());
  }, [walletBalance]);

  // Article methods
  const addArticle = (article: Omit<Article, 'id' | 'publishedDate' | 'views'>) => {
    const newArticle: Article = {
      ...article,
      id: Date.now().toString(),
      publishedDate: new Date().toISOString(),
      views: {
        total: 0,
        daily: [0, 0, 0, 0, 0, 0, 0],
        weekly: [0, 0, 0, 0, 0],
        monthly: [0, 0, 0, 0, 0, 0],
        sixMonths: [0, 0, 0, 0, 0, 0],
        yearly: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }
    };
    setArticles(prev => [...prev, newArticle]);
    
    // Update author's articles list
    const author = authors.find(a => a.id === article.authorId);
    if (author) {
      updateAuthor({
        ...author,
        articles: [...author.articles, newArticle.id]
      });
    }
  };

  const updateArticle = (updatedArticle: Article) => {
    setArticles(articles.map(article => 
      article.id === updatedArticle.id ? updatedArticle : article
    ));
  };

  const deleteArticle = (id: string) => {
    // Remove article from authors' article lists
    const articleToDelete = articles.find(a => a.id === id);
    if (articleToDelete) {
      const authorToUpdate = authors.find(a => a.id === articleToDelete.authorId);
      if (authorToUpdate) {
        updateAuthor({
          ...authorToUpdate,
          articles: authorToUpdate.articles.filter(articleId => articleId !== id)
        });
      }
    }
    
    // Delete the article
    setArticles(articles.filter(article => article.id !== id));
  };

  const getArticleById = (id: string) => {
    return articles.find(article => article.id === id);
  };

  const getArticlesByCategory = (category: CategoryType) => {
    return articles.filter(article => article.category === category);
  };

  // Author methods
  const addAuthor = (author: Omit<Author, 'id'>) => {
    const newAuthor: Author = {
      ...author,
      id: Date.now().toString(),
    };
    setAuthors([...authors, newAuthor]);
  };

  const updateAuthor = (updatedAuthor: Author) => {
    setAuthors(authors.map(author => 
      author.id === updatedAuthor.id ? updatedAuthor : author
    ));
  };

  const deleteAuthor = (id: string) => {
    setAuthors(authors.filter(author => author.id !== id));
    // Note: We should also handle deleting or reassigning the author's articles
  };

  const getAuthorById = (id: string) => {
    return authors.find(author => author.id === id);
  };

  // Wallet methods
  const updatePaypalEmail = (email: string) => {
    setPaypalEmail(email);
  };

  const requestWithdrawal = (amount: number) => {
    if (amount <= walletBalance) {
      const newWithdrawal: Withdrawal = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        status: 'completed' // Simulating immediate completion
      };
      setWithdrawals([...withdrawals, newWithdrawal]);
      setWalletBalance(walletBalance - amount);
    }
  };

  const recordEarnings = (articleId: string, amount: number, viewerIp?: string) => {
    // Check if we already have earnings from this IP for this article
    if (viewerIp && earnings.some(e => e.articleId === articleId && e.viewerIp === viewerIp)) {
      return; // Already recorded earnings from this viewer
    }

    const newEarning: Earnings = {
      id: Date.now().toString(),
      articleId,
      date: new Date().toISOString(),
      amount,
      viewerIp
    };
    setEarnings([...earnings, newEarning]);
    setWalletBalance(walletBalance + amount);
  };

  const addArticleView = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // Update article views
    setArticles(articles.map(article => {
      if (article.id === articleId) {
        const updatedViews = { ...article.views };
        
        // Update total views
        updatedViews.total += 1;
        
        // Update daily views (assuming index 0 is today)
        updatedViews.daily[0] += 1;
        
        // Update weekly views (assuming index 0 is current week)
        updatedViews.weekly[0] += 1;
        
        // Update monthly views (assuming index 0 is current month)
        updatedViews.monthly[0] += 1;
        
        // Update six months views (assuming index 0 is current 6-month period)
        updatedViews.sixMonths[0] += 1;
        
        // Update yearly views (assuming index 0 is current year)
        updatedViews.yearly[0] += 1;
        
        return { ...article, views: updatedViews };
      }
      return article;
    }));
    
    // Get visitor IP (mock for demo purposes)
    const mockIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    // Calculate earnings based on read time
    if (article) {
      // $5 per minute of reading time
      const earningsAmount = 5 * (article.readTime || 1);
      recordEarnings(articleId, earningsAmount, mockIp);
    }
  };

  return (
    <DataContext.Provider value={{
      articles,
      authors,
      earnings,
      withdrawals,
      paypalEmail,
      walletBalance,
      addArticle,
      updateArticle,
      deleteArticle,
      getArticleById,
      addAuthor,
      updateAuthor,
      deleteAuthor,
      getAuthorById,
      updatePaypalEmail,
      requestWithdrawal,
      recordEarnings,
      addArticleView,
      getArticlesByCategory
    }}>
      {children}
    </DataContext.Provider>
  );
};
