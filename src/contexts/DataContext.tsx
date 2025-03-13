
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
  recordEarnings: (articleId: string, amount: number) => void;
  addArticleView: (articleId: string) => void;
}

// Initial mock data
const initialArticles: Article[] = [
  {
    id: '1',
    title: 'The Mental Game: Psychology in Tennis',
    summary: 'How mental strength and psychological techniques impact performance in tennis',
    content: '<h1>The Mental Game: Psychology in Tennis</h1><p>Tennis is as much a mental game as it is physical. Many matches are won and lost in the mind before they are decided on the court.</p><h2>Focus and Concentration</h2><p>The ability to maintain focus during long matches can be the difference between winning and losing. Top players develop routines to stay present and focused on each point.</p><h2>Handling Pressure</h2><p>Critical points, tiebreakers, and championship opportunities all create pressure. The most successful players have techniques to perform their best when the stakes are highest.</p>',
    category: 'Tennis',
    authorId: '1',
    featuredImage: '/lovable-uploads/f165afe9-af65-437f-9984-d94abe8ef539.png',
    publishedDate: '2023-10-15T12:00:00Z',
    readTime: 5,
    views: {
      total: 1253,
      daily: [45, 32, 56, 78, 65, 34, 23],
      weekly: [245, 312, 278, 345, 289],
      monthly: [1200, 980, 1150, 1300, 1250, 1100],
      sixMonths: [5600, 6700, 7800, 6500, 7200, 8100],
      yearly: [15000, 17500, 16800, 18900, 21000, 19500, 17800, 16500, 15800, 19000, 20500, 21500]
    }
  },
  {
    id: '2',
    title: 'The Evolution of Modern Football Tactics',
    summary: 'How tactical innovations have shaped the modern game of football',
    content: '<h1>The Evolution of Modern Football Tactics</h1><p>Football tactics have evolved dramatically over the decades, changing how the game is played at the highest levels.</p><h2>From 2-3-5 to 4-3-3</h2><p>The original formations used in football looked nothing like what we see today. The evolution from the 2-3-5 "pyramid" to modern formations reflects changes in how coaches approach the game.</p><h2>The Rise of Pressing</h2><p>High-intensity pressing has become a staple of modern football, with teams like Liverpool and Manchester City using coordinated pressing to win the ball in dangerous areas.</p>',
    category: 'Football',
    authorId: '1',
    featuredImage: '/public/placeholder.svg',
    publishedDate: '2023-09-28T10:30:00Z',
    readTime: 6,
    views: {
      total: 1876,
      daily: [67, 45, 89, 56, 78, 90, 45],
      weekly: [345, 412, 378, 445, 389],
      monthly: [1500, 1280, 1350, 1600, 1450, 1300],
      sixMonths: [6600, 7700, 8800, 7500, 8200, 9100],
      yearly: [18000, 20500, 19800, 21900, 24000, 22500, 20800, 19500, 18800, 22000, 23500, 24500]
    }
  }
];

const initialAuthors: Author[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'kunalsonpitre555@yahoo.com',
    bio: 'Sports journalist and analyst with over 10 years of experience covering major sporting events worldwide.',
    profileImage: '/public/placeholder.svg',
    articles: ['1', '2']
  }
];

const initialEarnings: Earnings[] = [
  {
    id: '1',
    articleId: '1',
    date: '2023-10-16T08:15:00Z',
    amount: 25 // $5 * 5 minute read time
  },
  {
    id: '2',
    articleId: '2',
    date: '2023-09-29T14:20:00Z',
    amount: 30 // $5 * 6 minute read time
  }
];

const initialWithdrawals: Withdrawal[] = [
  {
    id: '1',
    date: '2023-10-20T10:00:00Z',
    amount: 50,
    status: 'completed'
  }
];

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
    return storedEmail || '';
  });
  
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const storedBalance = localStorage.getItem('manusSportsWalletBalance');
    return storedBalance ? parseFloat(storedBalance) : 55; // Initial balance
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
    setArticles([...articles, newArticle]);
    
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

  const recordEarnings = (articleId: string, amount: number) => {
    const newEarning: Earnings = {
      id: Date.now().toString(),
      articleId,
      date: new Date().toISOString(),
      amount
    };
    setEarnings([...earnings, newEarning]);
    setWalletBalance(walletBalance + amount);
  };

  const addArticleView = (articleId: string) => {
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
    
    // Simulate earnings based on article views (in a real app, this would be more complex)
    const article = articles.find(a => a.id === articleId);
    if (article) {
      // Each view earns $5 per minute of reading time (simplified for demonstration)
      const earningsAmount = 5 * article.readTime;
      recordEarnings(articleId, earningsAmount);
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
      addArticleView
    }}>
      {children}
    </DataContext.Provider>
  );
};
