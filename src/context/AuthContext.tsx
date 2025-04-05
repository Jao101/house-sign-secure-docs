
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Document } from '@/components/DocumentCard';
import { v4 as uuidv4 } from 'uuid';

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  documents: Document[];
  addDocument: (document: Document) => void;
  updateDocument: (documentId: string, updates: Partial<Document>) => void;
  deleteDocument: (documentId: string) => void;
  saveDocumentFile: (file: File) => Promise<string>;
  getDocumentFile: (fileId: string) => string | null;
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

// Load users from localStorage or use default mock users
const loadUsers = (): any[] => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  return [
    {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User'
    }
  ];
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<any[]>(() => loadUsers());
  const [documentFiles, setDocumentFiles] = useState<Record<string, string>>({});

  // Define isAuthenticated computed property
  const isAuthenticated = user !== null;
  // Alias isLoading to loading for backward compatibility
  const loading = isLoading;

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const storedDocuments = localStorage.getItem('documents');
    const storedFiles = localStorage.getItem('documentFiles');
    
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
    
    if (storedFiles) {
      setDocumentFiles(JSON.parse(storedFiles));
    }
    
    setIsLoading(false);
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('documents', JSON.stringify(documents));
    }
  }, [documents]);

  // Save document files to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(documentFiles).length > 0) {
      localStorage.setItem('documentFiles', JSON.stringify(documentFiles));
    }
  }, [documentFiles]);

  const saveDocumentFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileId = uuidv4();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const fileData = event.target.result as string;
          setDocumentFiles(prevFiles => {
            const updatedFiles = { ...prevFiles, [fileId]: fileData };
            localStorage.setItem('documentFiles', JSON.stringify(updatedFiles));
            return updatedFiles;
          });
          resolve(fileId);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const getDocumentFile = (fileId: string): string | null => {
    return documentFiles[fileId] || null;
  };

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

  const deleteDocument = (documentId: string) => {
    // Find the document to get its fileId before deletion
    const documentToDelete = documents.find(doc => doc.id === documentId);
    
    // Remove document from documents array
    setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentId));
    
    // If document has a fileId, remove the file data
    if (documentToDelete && documentToDelete.fileId) {
      setDocumentFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        delete newFiles[documentToDelete.fileId as string];
        localStorage.setItem('documentFiles', JSON.stringify(newFiles));
        return newFiles;
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email && u.password === password);
    
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
    if (users.some(u => u.email === email)) {
      setIsLoading(false);
      throw new Error('User already exists with this email');
    }
    
    // Create name from firstName and lastName
    const name = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || lastName || email.split('@')[0];
    
    // Create the new user
    const newUser = { email, password, firstName, lastName, name };
    
    // Update users array with the new user
    setUsers(prevUsers => [...prevUsers, newUser]);
    
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
      loading,
      isAuthenticated,
      login, 
      signup, 
      logout,
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      saveDocumentFile,
      getDocumentFile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
