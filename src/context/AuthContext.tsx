
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

// In a real application, this would connect to a backend service
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem("housesign_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data");
        localStorage.removeItem("housesign_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would make an API call
      // Mock successful authentication
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      // For demo, create a mock user
      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name: email.split('@')[0],
      };
      
      // Store user in local storage
      localStorage.setItem("housesign_user", JSON.stringify(mockUser));
      setUser(mockUser);
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
      // In a real app, this would make an API call
      // Mock successful registration
      if (!email || !password || !name) {
        throw new Error("All fields are required");
      }
      
      // For demo, create a mock user
      const mockUser = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        name,
      };
      
      // Store user in local storage
      localStorage.setItem("housesign_user", JSON.stringify(mockUser));
      setUser(mockUser);
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
    localStorage.removeItem("housesign_user");
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
