import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePen, Download, Share, ChevronLeft, FileCheck, Clock, Pen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import PDFViewer from "@/components/PDFViewer";

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents, updateDocument, user } = useAuth();
  const { toast } = useToast();
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [document, setDocument] = useState<any>(null);
  
  const samplePdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  
  useEffect(() => {
    if (documents && id) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        const enhancedDoc = {
          ...doc,
          signers: Array.isArray(doc.signers) ? doc.signers.map(signer => {
            if (typeof signer === 'string') {
              return {
                email: signer,
                name: signer.split('@')[0],
                status: "pending",
                timestamp: null
              };
            }
            return signer;
          }) : []
        };
        setDocument(enhancedDoc);
      }
    }
  }, [documents, id]);

  const handleSignStart = () => {
    setIsSignatureMode(true);
  };

  const handleSignCancel = () => {
    setIsSignatureMode(false);
    if (signatureCanvasRef.current) {
      const context = signatureCanvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
      }
    }
  };

  const handleSignDocument = () => {
    if (!document || !user) return;
    
    const updatedSigners = document.signers.map((signer: any) => {
      if (signer.email === user.email) {
        return {
          ...signer,
          status: "signed",
          timestamp: new Date()
        };
      }
      return signer;
    });

    const allSigned = updatedSigners.every((signer: any) => signer.status === "signed");
    
    const newStatus = allSigned ? "completed" : "awaiting_signatures";
    
    updateDocument(document.id, { 
      signers: updatedSigners,
      status: newStatus
    });
    
    setDocument({
      ...document,
      signers: updatedSigners,
      status: newStatus
    });
    
    setIsSignatureMode(false);
    
    toast({
      title: "Document signed successfully",
      description: "Your signature has been added to the document",
    });
  };
  
  const [isDrawing, setIsDrawing] = useState(false);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    context.beginPath();
    context.moveTo(clientX - rect.left, clientY - rect.top);
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = '#1e3a8a';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault(); // Prevent scrolling when drawing
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    context.lineTo(clientX - rect.left, clientY - rect.top);
    context.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!document) {
    return (
      <AuthGuard>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <p>Loading document...</p>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  const canSign = document.signers.some((signer: any) => 
    signer.email === user?.email && signer.status === "pending"
  );

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
                {isSignatureMode ? (
                  <Card className="h-[600px] flex flex-col items-center justify-between bg-gray-50 p-6">
                    <div className="w-full text-center mb-4">
                      <h3 className="text-lg font-medium">Sign Document</h3>
                      <p className="text-gray-500">Please draw your signature below</p>
                    </div>
                    
                    <div className="flex-1 w-full flex items-center justify-center border-b border-dashed border-gray-300 mb-4">
                      <canvas 
                        ref={signatureCanvasRef}
                        width={500}
                        height={200}
                        className="border border-gray-200 bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleSignCancel}>
                        Clear
                      </Button>
                      <Button 
                        className="bg-housesign-600 hover:bg-housesign-700"
                        onClick={handleSignDocument}
                      >
                        Complete Signing
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="h-[600px]">
                    <PDFViewer 
                      file={samplePdfUrl}
                      fallback={
                        <Card className="h-full flex items-center justify-center bg-gray-50">
                          <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center">
                            <FilePen className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">No document preview available</p>
                            <p className="text-sm text-gray-400 mt-2">Please upload a PDF document</p>
                          </CardContent>
                        </Card>
                      }
                    />
                  </div>
                )}
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
                            <p className="font-medium">{document.updatedAt?.toLocaleDateString() || 'N/A'}</p>
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
                  <>
                    {canSign && (
                      <Button 
                        className="w-full mt-4 bg-housesign-600 hover:bg-housesign-700"
                        onClick={handleSignStart}
                      >
                        <Pen className="h-4 w-4 mr-2" />
                        Sign Document
                      </Button>
                    )}
                    <Button className="w-full mt-4" variant="outline">
                      Remind Signers
                    </Button>
                  </>
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
