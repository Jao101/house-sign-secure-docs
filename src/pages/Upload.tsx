import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FileText, FilePlus, X, Plus, UploadIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Document, SigningField } from "@/components/DocumentCard";
import SigningFieldsEditor from "@/components/SigningFieldsEditor";
import { v4 as uuidv4 } from "uuid";

const UploadPage = () => {
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [recipients, setRecipients] = useState([{ email: "", name: "" }]);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [signingFields, setSigningFields] = useState<SigningField[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, addDocument, saveDocumentFile } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileChange = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    if (!documentTitle) {
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setDocumentTitle(fileName);
    }
    
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      setPdfUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleAddRecipient = () => {
    setRecipients([...recipients, { email: "", name: "" }]);
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
  };

  const handleRecipientChange = (index: number, field: 'email' | 'name', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const docId = `doc-${Date.now()}`;
      
      let fileId = "";
      if (selectedFile) {
        fileId = await saveDocumentFile(selectedFile);
      }
      
      const newDocument: Document = {
        id: docId,
        title: documentTitle,
        status: "awaiting_signatures",
        updatedAt: new Date(),
        signers: recipients.map(recipient => recipient.email),
        fileId: fileId,
        owner: user?.email,
        signingFields: signingFields.length > 0 ? signingFields : undefined,
      };
      
      addDocument(newDocument);
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document is ready for signatures",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-8">
          <div className="container max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Upload Document</h1>
              <p className="text-gray-500 mt-1">Upload documents for signatures</p>
            </div>

            <form onSubmit={handleUpload}>
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="documentTitle">Document Title</Label>
                        <Input
                          id="documentTitle"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          placeholder="Enter document title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Upload Document</Label>
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${isDragging ? 'border-housesign-500 bg-housesign-50' : 'border-gray-300'}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {selectedFile ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="h-6 w-6 text-housesign-600" />
                              <span className="font-medium">{selectedFile.name}</span>
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                className="ml-2 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile(null);
                                  setPdfUrl(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex flex-col items-center justify-center">
                                <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="font-medium">Drag and drop or click to upload</p>
                                <p className="text-sm text-gray-500">PDF, DOC, DOCX (max 10MB)</p>
                              </div>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileInputChange}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {pdfUrl && (
                  <Card>
                    <CardContent className="pt-6">
                      <Label className="mb-2 block">Document Preview & Signature Fields</Label>
                      <p className="text-sm text-gray-500 mb-4">
                        Preview your document and add signature fields by clicking on the PDF where you want signatures to appear. 
                        You can drag and resize the fields as needed.
                      </p>
                      
                      <SigningFieldsEditor 
                        fields={signingFields}
                        onChange={setSigningFields}
                        pdfUrl={pdfUrl}
                      />
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Recipients</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddRecipient}
                          className="text-housesign-600 border-housesign-300"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Recipient
                        </Button>
                      </div>

                      {recipients.map((recipient, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <div>
                              <Input
                                placeholder="Email"
                                value={recipient.email}
                                onChange={(e) => handleRecipientChange(index, 'email', e.target.value)}
                                required
                                type="email"
                              />
                            </div>
                            <div>
                              <Input
                                placeholder="Name"
                                value={recipient.name}
                                onChange={(e) => handleRecipientChange(index, 'name', e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          {recipients.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="flex-shrink-0 text-gray-500"
                              onClick={() => handleRemoveRecipient(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isUploading || !selectedFile || !documentTitle}
                      className="bg-housesign-600 hover:bg-housesign-700"
                    >
                      {isUploading ? "Uploading..." : "Continue"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </form>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default UploadPage;
