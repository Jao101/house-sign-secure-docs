
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePen, Download, Share, ChevronLeft, FileCheck, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // In a real app, fetch document data from API
  const [document] = useState({
    id: id,
    title: id === "doc-1" ? "Purchase Agreement" 
          : id === "doc-2" ? "Rental Contract" 
          : "Disclosure Statement",
    status: id === "doc-1" ? "completed" 
           : id === "doc-2" ? "awaiting_signatures" 
           : "draft",
    createdAt: new Date(2025, 3, 1),
    signers: [
      { name: "John Smith", email: "john@example.com", status: "signed", timestamp: new Date(2025, 3, 2) },
      id === "doc-1" ? 
        { name: "Sara Miller", email: "sara@example.com", status: "signed", timestamp: new Date(2025, 3, 3) } :
        id === "doc-2" ? 
          { name: "Mike Johnson", email: "mike@example.com", status: "pending", timestamp: null } :
          null
    ].filter(Boolean),
  });

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-8">
          <div className="container">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{document.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {document.status === "completed" ? (
                      <>
                        <FileCheck className="h-4 w-4 text-green-500" />
                        <Badge variant="outline" className="text-green-500 border-green-300">Completed</Badge>
                      </>
                    ) : document.status === "awaiting_signatures" ? (
                      <>
                        <Clock className="h-4 w-4 text-amber-500" />
                        <Badge variant="outline" className="text-amber-500 border-amber-300">Awaiting Signatures</Badge>
                      </>
                    ) : (
                      <>
                        <FilePen className="h-4 w-4 text-gray-500" />
                        <Badge variant="outline" className="text-gray-500 border-gray-300">Draft</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex items-center justify-center bg-gray-50">
                  <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center">
                    {/* In a real app, this would be an actual document viewer */}
                    <FilePen className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500">Document preview would be displayed here</p>
                    <p className="text-sm text-gray-400 mt-2">PDF Viewer not available in demo</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Tabs defaultValue="details">
                  <TabsList className="w-full">
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Document Title</h3>
                            <p className="font-medium">{document.title}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Status</h3>
                            <p className="font-medium capitalize">{document.status.replace("_", " ")}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Created</h3>
                            <p className="font-medium">{document.createdAt.toLocaleDateString()}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Signers</h3>
                            {document.signers.map((signer, i) => (
                              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                  <p className="font-medium">{signer.name}</p>
                                  <p className="text-sm text-gray-500">{signer.email}</p>
                                </div>
                                <div>
                                  {signer.status === "signed" ? (
                                    <Badge variant="outline" className="text-green-500 border-green-300">Signed</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-500 border-amber-300">Pending</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="activity">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="space-y-4">
                            {document.status === "completed" ? (
                              <>
                                <div className="flex">
                                  <div className="mt-1 mr-3">
                                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                  </div>
                                  <div>
                                    <p className="font-medium">Document Completed</p>
                                    <p className="text-sm text-gray-500">All parties have signed</p>
                                    <p className="text-xs text-gray-400 mt-1">April 3, 2025, 10:30 AM</p>
                                  </div>
                                </div>
                                {document.signers.map((signer, i) => (
                                  <div key={i} className="flex">
                                    <div className="mt-1 mr-3">
                                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div>
                                      <p className="font-medium">{signer.name} signed the document</p>
                                      <p className="text-xs text-gray-400 mt-1">{signer.timestamp?.toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : document.status === "awaiting_signatures" ? (
                              <>
                                <div className="flex">
                                  <div className="mt-1 mr-3">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                  </div>
                                  <div>
                                    <p className="font-medium">Document Sent for Signing</p>
                                    <p className="text-sm text-gray-500">Waiting for signatures</p>
                                    <p className="text-xs text-gray-400 mt-1">April 2, 2025, 3:15 PM</p>
                                  </div>
                                </div>
                                {document.signers.map((signer, i) => (
                                  <div key={i} className="flex">
                                    <div className="mt-1 mr-3">
                                      <div className={`h-2 w-2 ${signer.status === "signed" ? "bg-green-500" : "bg-gray-300"} rounded-full`}></div>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {signer.status === "signed" 
                                          ? `${signer.name} signed the document` 
                                          : `Waiting for ${signer.name}`}
                                      </p>
                                      {signer.timestamp && (
                                        <p className="text-xs text-gray-400 mt-1">{signer.timestamp.toLocaleString()}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="flex">
                                <div className="mt-1 mr-3">
                                  <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                                </div>
                                <div>
                                  <p className="font-medium">Document Created</p>
                                  <p className="text-sm text-gray-500">Saved as draft</p>
                                  <p className="text-xs text-gray-400 mt-1">April 1, 2025, 9:45 AM</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                {document.status === "draft" && (
                  <Button className="w-full mt-4 bg-housesign-600 hover:bg-housesign-700">
                    Edit Document
                  </Button>
                )}
                
                {document.status === "awaiting_signatures" && (
                  <Button className="w-full mt-4 bg-housesign-600 hover:bg-housesign-700">
                    Remind Signers
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default ViewDocument;
