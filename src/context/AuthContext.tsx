
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Document } from '@/components/DocumentCard';

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Added name property
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Added isAuthenticated property
  loading: boolean; // Added loading property
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (documentId: string, updates: Partial<Document>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user database
const mockUsers = [
  {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User' // Added name for consistency
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      title: "Purchase Agreement",
      status: "completed",
      updatedAt: new Date(2025, 3, 1),
      signers: ["john@example.com", "sara@example.com"],
    },
    {
      id: "doc-2",
      title: "Rental Contract",
      status: "awaiting_signatures",
      updatedAt: new Date(2025, 3, 2), 
      signers: ["mike@example.com"],
    },
    {
      id: "doc-3",
      title: "Disclosure Statement",
      status: "draft",
      updatedAt: new Date(2025, 3, 3),
      signers: [],
    },
  ]);

  // Define isAuthenticated computed property
  const isAuthenticated = user !== null;
  // Alias isLoading to loading for backward compatibility
  const loading = isLoading;

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const storedDocuments = localStorage.getItem('documents');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedDocuments) {
      const parsedDocuments = JSON.parse(storedDocuments);
      // Convert string dates back to Date objects
      const documentsWithDates = parsedDocuments.map((doc: any) => ({
        ...doc,
        updatedAt: new Date(doc.updatedAt)
      }));
      setDocuments(documentsWithDates);
    }
    
    setIsLoading(false);
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('documents', JSON.stringify(documents));
    }
  }, [documents]);

  const addDocument = (document: Document) => {
    setDocuments(prevDocuments => [...prevDocuments, document]);
  };

  const updateDocument = (documentId: string, updates: Partial<Document>) => {
    setDocuments(prevDocuments => 
      prevDocuments.map(doc => 
        doc.id === documentId ? { ...doc, ...updates } : doc
      )
    );
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }
    
    const { password: _, ...userWithoutPassword } = foundUser;
    
    // Ensure the user object has a name property
    const userWithName = {
      ...userWithoutPassword,
      name: userWithoutPassword.name || `${userWithoutPassword.firstName || ''} ${userWithoutPassword.lastName || ''}`.trim()
    };
    
    setUser(userWithName);
    localStorage.setItem('user', JSON.stringify(userWithName));
    
    setIsLoading(false);
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      setIsLoading(false);
      throw new Error('User already exists with this email');
    }
    
    // Create name from firstName and lastName
    const name = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || lastName || email.split('@')[0];
    
    // In a real app, this would be saved to a database
    const newUser = { email, password, firstName, lastName, name };
    mockUsers.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      loading, // Include the alias
      isAuthenticated, // Include computed property
      login, 
      signup, 
      logout,
      documents,
      addDocument,
      updateDocument
    }}>
      {children}
    </AuthContext.Provider>
  );
};
