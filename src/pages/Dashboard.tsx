import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocumentCard from "@/components/DocumentCard";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user, documents } = useAuth();
  
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Your Documents</h1>
                <p className="text-gray-500 mt-1">Manage your documents and signatures</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button asChild className="bg-housesign-600 hover:bg-housesign-700">
                  <Link to="/upload">
                    <Plus className="mr-2 h-4 w-4" />
                    New Document
                  </Link>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="awaiting">Awaiting Signatures</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No documents yet</h3>
                      <p className="text-gray-500 mb-6">Upload your first document to get started</p>
                      <Button asChild className="bg-housesign-600 hover:bg-housesign-700">
                        <Link to="/upload">
                          <Plus className="mr-2 h-4 w-4" />
                          New Document
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="awaiting">
                {documents.filter(doc => doc.status === "awaiting_signatures").length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => doc.status === "awaiting_signatures")
                      .map((doc) => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="py-12 text-center">
                      <h3 className="text-lg font-medium mb-2">No documents awaiting signatures</h3>
                      <p className="text-gray-500">All caught up!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {documents.filter(doc => doc.status === "completed").length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => doc.status === "completed")
                      .map((doc) => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="py-12 text-center">
                      <h3 className="text-lg font-medium mb-2">No completed documents</h3>
                      <p className="text-gray-500">Documents will appear here once signed by all parties</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="drafts">
                {documents.filter(doc => doc.status === "draft").length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents
                      .filter(doc => doc.status === "draft")
                      .map((doc) => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                  </div>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="py-12 text-center">
                      <h3 className="text-lg font-medium mb-2">No draft documents</h3>
                      <p className="text-gray-500">Draft documents will appear here</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent document activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">Purchase Agreement was signed</p>
                          <p className="text-sm text-gray-500">Completed by all parties</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">3 days ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">Rental Contract was sent</p>
                          <p className="text-sm text-gray-500">Awaiting signature from Mike</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 days ago</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium">Disclosure Statement was created</p>
                          <p className="text-sm text-gray-500">Saved as draft</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
