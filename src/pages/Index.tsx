
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileSignature, Shield, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight fade-in">
            Document Signing, <span className="text-housesign-600">Simplified</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl fade-in">
            HouseSign is the open source platform for secure document signing, perfect for real estate, legal agreements, and more.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 fade-in">
            {isAuthenticated ? (
              <Button asChild size="lg" className="bg-housesign-600 hover:bg-housesign-700">
                <Link to="/upload">Upload Document</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-housesign-600 hover:bg-housesign-700">
                <Link to="/signup">Get Started Free</Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to="#features">Learn More</Link>
            </Button>
          </div>
          <div className="mt-12 md:mt-20 w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden fade-in">
            <img src="https://placehold.co/1200x600/EFF6FF/1E40AF?text=HouseSign+Interface+Preview" alt="HouseSign Interface Preview" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need for document signing</h2>
            <p className="mt-4 text-xl text-gray-600">Powerful features that scale with your needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-12 w-12 bg-housesign-100 rounded-lg flex items-center justify-center mb-4">
                <FileSignature className="h-6 w-6 text-housesign-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Electronic Signatures</h3>
              <p className="text-gray-600">Legally binding e-signatures that comply with ESIGN and eIDAS regulations.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-12 w-12 bg-housesign-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-housesign-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Bank-level security with encryption at rest and in transit for your documents.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-12 w-12 bg-housesign-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-housesign-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Analytics</h3>
              <p className="text-gray-600">Track document status, views, and completion rates with detailed analytics.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-12 w-12 bg-housesign-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-housesign-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Audit Trail</h3>
              <p className="text-gray-600">Comprehensive audit trails to ensure compliance and validity of signatures.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-12 w-12 bg-housesign-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-housesign-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Branding</h3>
              <p className="text-gray-600">Personalize the signing experience with your brand colors and logo.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <div className="h-12 w-12 bg-housesign-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-housesign-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">API Integration</h3>
              <p className="text-gray-600">Seamlessly integrate with your existing tools through our robust API.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-housesign-600 hover:bg-housesign-700">
              <Link to="/signup">Start Using HouseSign Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Trusted by businesses worldwide</h2>
            <p className="mt-4 text-xl text-gray-600">See what our users have to say</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-gray-600">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">John Doe</h4>
                  <p className="text-sm text-gray-600">Real Estate Agent</p>
                </div>
              </div>
              <p className="text-gray-600">"HouseSign has dramatically improved our closing process. Documents are signed in minutes instead of days."</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-gray-600">JS</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jane Smith</h4>
                  <p className="text-sm text-gray-600">Attorney</p>
                </div>
              </div>
              <p className="text-gray-600">"The audit trail feature gives us confidence in the legal validity of our signed documents. Excellent product."</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-gray-600">RJ</span>
                </div>
                <div>
                  <h4 className="font-semibold">Robert Johnson</h4>
                  <p className="text-sm text-gray-600">Sales Manager</p>
                </div>
              </div>
              <p className="text-gray-600">"We've cut our contract turnaround time in half since implementing HouseSign. Our clients love the simplicity."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="bg-housesign-800 text-white rounded-2xl p-8 md:p-12 text-center md:text-left md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Ready to simplify your document workflow?</h2>
              <p className="mt-2 md:text-lg opacity-90">Join thousands of businesses using HouseSign today.</p>
            </div>
            <div className="mt-6 md:mt-0">
              <Button asChild size="lg" className="bg-white text-housesign-800 hover:bg-gray-100">
                <Link to="/signup">Get Started For Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
