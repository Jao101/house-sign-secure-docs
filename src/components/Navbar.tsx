
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { FilePenLine, Home, LogOut, User } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <FilePenLine className="h-6 w-6 text-housesign-700" />
          <span className="text-xl font-bold text-housesign-800">HouseSign</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-housesign-700 transition-colors">
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-housesign-700 transition-colors">
                Dashboard
              </Link>
              <Link to="/upload" className="text-sm font-medium hover:text-housesign-700 transition-colors">
                Upload Document
              </Link>
            </>
          )}
          <Link to="#" className="text-sm font-medium hover:text-housesign-700 transition-colors">
            Features
          </Link>
          <Link to="#" className="text-sm font-medium hover:text-housesign-700 transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <User className="h-4 w-4 opacity-70" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-housesign-600 hover:bg-housesign-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
