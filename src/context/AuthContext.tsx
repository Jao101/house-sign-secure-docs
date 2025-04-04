
import React, { createContext, useState, useContext, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constants for local storage keys
const USER_STORAGE_KEY = "housesign_user";
const REGISTERED_USERS_KEY = "housesign_registered_users";

// Type for storing registered users
type RegisteredUser = {
  id: string;
  email: string;
  name: string;
  password: string;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data");
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Helper function to get registered users
  const getRegisteredUsers = (): RegisteredUser[] => {
    const usersJson = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!usersJson) return [];
    
    try {
      return JSON.parse(usersJson);
    } catch (error) {
      console.error("Failed to parse registered users data");
      return [];
    }
  };

  // Helper function to save registered users
  const saveRegisteredUsers = (users: RegisteredUser[]): void => {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      const registeredUsers = getRegisteredUsers();
      const foundUser = registeredUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Create a user object without the password
      const authenticatedUser: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };
      
      // Store user in local storage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
      toast({
        title: "Login successful",
        description: "Welcome back to HouseSign!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      if (!email || !password || !name) {
        throw new Error("All fields are required");
      }
      
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      const registeredUsers = getRegisteredUsers();
      
      // Check if email already exists
      if (registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already registered");
      }
      
      // Create a new user
      const newUser: RegisteredUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
        password,
      };
      
      // Save the new user
      saveRegisteredUsers([...registeredUsers, newUser]);
      
      // Create an authenticated user object (without password)
      const authenticatedUser: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };
      
      // Store user in local storage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      
      toast({
        title: "Account created",
        description: "Welcome to HouseSign!",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out of HouseSign",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
