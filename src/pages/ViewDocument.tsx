import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePen, Download, Share, ChevronLeft, FileCheck, Clock, Trash2, Signature } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import PDFViewer from "@/components/PDFViewer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import SignatureField from "@/components/SignatureField";
import { Document, SigningField } from "@/components/DocumentCard";
import { downloadDocument, shareDocument } from "@/utils/documentUtils";
import { 
  canRevokeSignature, 
  getSignerName, 
  getSignerEmail, 
  getSignerStatus,
  getSignerTimestamp 
} from "@/utils/signatureUtils";

const ViewDocument = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { documents, updateDocument, user, deleteDocument, getDocumentFile } = useAuth();
  const { toast } = useToast();
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeSigningField, setActiveSigningField] = useState<string | null>(null);
  const [signatureDates, setSignatureDates] = useState<Record<string, Date>>({});
  
  const isSharedView = searchParams.get('share') === 'true';
  const samplePdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";
  
  // Helper function to check if a user is a signer
  const isUserSigner = (user: any, signers: Array<string | { email: string; name: string; status: string; timestamp: Date | null }>) => {
    if (!user) return false;
    
    return signers.some(signer => {
      if (typeof signer === 'string') {
        return signer === user.email;
      }
      return signer.email === user.email;
    });
  };

  useEffect(() => {
    if (documents && id) {
      const doc = documents.find(d => d.id === id);
      if (doc) {
        const enhancedDoc = {
          ...doc,
          owner: doc.owner || user?.email,
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
        
        // Create a mapping of field IDs to signature dates for revocation check
        const dateMap: Record<string, Date> = {};
        if (doc.signingFields) {
          doc.signingFields.forEach(field => {
            if (field.signedBy && field.signedTimestamp) {
              dateMap[field.id] = new Date(field.signedTimestamp);
            }
          });
        }
        setSignatureDates(dateMap);
        
        if (doc.fileId) {
          const fileData = getDocumentFile(doc.fileId);
          if (fileData) {
            setPdfUrl(fileData);
          } else {
            setPdfUrl(samplePdfUrl);
          }
        } else {
          setPdfUrl(samplePdfUrl);
        }
      }
    }
  }, [documents, id, getDocumentFile, user]);

  const handleDeleteDocument = () => {
    if (!document) return;
    
    deleteDocument(document.id);
    
    toast({
      title: "Dokument gelöscht",
      description: "Das Dokument wurde dauerhaft entfernt",
    });
    
    navigate("/dashboard");
  };

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

  const handleSignField = (fieldId: string, signatureData: string) => {
    if (!document || !user) return;
    
    let signerExists = false;
    const updatedSigners = document.signers.map((signer) => {
      if (typeof signer === 'string') {
        if (signer === user.email) {
          signerExists = true;
          return {
            email: signer,
            name: signer.split('@')[0],
            status: "signed",
            timestamp: new Date()
          };
        }
        return signer;
      } else {
        if (signer.email === user.email) {
          signerExists = true;
          return {
            ...signer,
            status: "signed",
            timestamp: new Date()
          };
        }
        return signer;
      }
    });
    
    if (!signerExists && user.email === document.owner) {
      updatedSigners.push({
        email: user.email,
        name: user.name || user.email.split('@')[0],
        status: "signed",
        timestamp: new Date()
      });
    }

    const currentDate = new Date();
    
    // Store the signature date for revocation check
    setSignatureDates({
      ...signatureDates,
      [fieldId]: currentDate
    });

    const updatedSigningFields = document.signingFields ? document.signingFields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          signedBy: user.email,
          signatureImageData: signatureData, // Store the actual signature image data
          signedTimestamp: currentDate
        };
      }
      return field;
    }) : [];

    const allSigned = updatedSigners.every(signer => {
      if (typeof signer === 'string') {
        return false; // String signers are considered unsigned
      }
      return signer.status === "signed";
    });
    
    const allFieldsSigned = !document.signingFields || document.signingFields.every(field => field.signedBy !== null);
    
    const newStatus = (allSigned && allFieldsSigned) ? "completed" : "awaiting_signatures";
    
    updateDocument(document.id, { 
      signers: updatedSigners as Array<string | { email: string; name: string; status: string; timestamp: Date | null }>,
      status: newStatus,
      signingFields: updatedSigningFields.length > 0 ? updatedSigningFields : undefined
    });
    
    setDocument({
      ...document,
      signers: updatedSigners as Array<string | { email: string; name: string; status: string; timestamp: Date | null }>,
      status: newStatus,
      signingFields: updatedSigningFields.length > 0 ? updatedSigningFields : document.signingFields
    });
    
    toast({
      title: "Unterschrift erfolgreich hinzugefügt",
      description: "Ihre Unterschrift wurde zum Dokument hinzugefügt",
    });
  };

  const handleRevokeSignature = (fieldId: string) => {
    if (!document || !user) return;
    
    // Check if the signature can be revoked (within 5 minutes)
    const signatureDate = signatureDates[fieldId];
    if (!signatureDate || !canRevokeSignature(signatureDate)) {
      toast({
        title: "Rücknahme nicht möglich",
        description: "Die Unterschrift kann nur innerhalb von 5 Minuten nach dem Signieren zurückgezogen werden.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove the signature from the field
    const updatedSigningFields = document.signingFields ? document.signingFields.map(field => {
      if (field.id === fieldId) {
        return {
          ...field,
          signedBy: null,
          signatureImageData: null,
          signedTimestamp: null
        };
      }
      return field;
    }) : [];
    
    // Update signature dates
    const newSignatureDates = { ...signatureDates };
    delete newSignatureDates[fieldId];
    setSignatureDates(newSignatureDates);
    
    // Check if the user has any remaining signatures
    const userStillHasSignatures = updatedSigningFields.some(field => field.signedBy === user.email);
    
    // Update signer status if user has removed all their signatures
    let updatedSigners = [...document.signers];
    if (!userStillHasSignatures) {
      updatedSigners = document.signers.map((signer: any) => {
        if (signer.email === user.email) {
          return {
            ...signer,
            status: "pending",
            timestamp: null
          };
        }
        return signer;
      });
    }
    
    // Update document status
    const allSigned = updatedSigners.every((signer: any) => signer.status === "signed");
    const allFieldsSigned = updatedSigningFields.every(field => field.signedBy !== null);
    const newStatus = (allSigned && allFieldsSigned) ? "completed" : "awaiting_signatures";
    
    updateDocument(document.id, { 
      signers: updatedSigners as Array<string | { email: string; name: string; status: string; timestamp: Date | null }>,
      status: newStatus,
      signingFields: updatedSigningFields
    });
    
    setDocument({
      ...document,
      signers: updatedSigners as Array<string | { email: string; name: string; status: string; timestamp: Date | null }>,
      status: newStatus,
      signingFields: updatedSigningFields
    });
    
    toast({
      title: "Unterschrift zurückgezogen",
      description: "Ihre Unterschrift wurde entfernt"
    });
  };

  const handleSignDocument = () => {
    if (!document || !user) return;
    
    let signerExists = false;
    const updatedSigners = document.signers.map((signer) => {
      if (typeof signer === 'string') {
        if (signer === user.email) {
          signerExists = true;
          return {
            email: signer,
            name: signer.split('@')[0],
            status: "signed",
            timestamp: new Date()
          };
        }
        return signer;
      } else {
        if (signer.email === user.email) {
          signerExists = true;
          return {
            ...signer,
            status: "signed",
            timestamp: new Date()
          };
        }
        return signer;
      }
    });
    
    if (!signerExists && user.email === document.owner) {
      updatedSigners.push({
        email: user.email,
        name: user.name || user.email.split('@')[0],
        status: "signed",
        timestamp: new Date()
      });
    }

    const allSigned = updatedSigners.every(signer => {
      if (typeof signer === 'string') {
        return false; // String signers are considered unsigned
      }
      return signer.status === "signed";
    });
    
    const newStatus = allSigned ? "completed" : "awaiting_signatures";
    
    updateDocument(document.id, { 
      signers: updatedSigners as Array<string | { email: string; name: string; status: string; timestamp: Date | null }>,
      status: newStatus
    });
    
    setDocument({
      ...document,
      signers: updatedSigners as Array<string | { email: string; name: string; status: string; timestamp: Date | null }>,
      status: newStatus
    });
    
    setIsSignatureMode(false);
    
    toast({
      title: "Dokument erfolgreich unterschrieben",
      description: "Ihre Unterschrift wurde zum Dokument hinzugefügt",
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
      e.preventDefault();
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

  const handleDownload = async () => {
    if (!document) return;
    
    await downloadDocument(document.title, pdfUrl, document.signingFields);
    
    toast({
      title: "Dokument heruntergeladen",
      description: "Das Dokument wurde auf Ihr Gerät heruntergeladen",
    });
  };
  
  const handleShare = async () => {
    if (!document) return;
    
    const success = await shareDocument(document.id);
    
    if (success) {
      toast({
        title: "Link kopiert",
        description: "Ein Link zum Dokument wurde in Ihre Zwischenablage kopiert",
      });
    } else {
      toast({
        title: "Fehler beim Teilen",
        description: "Der Link konnte nicht kopiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  if (!document) {
    return (
      <AuthGuard>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <p>Dokument wird geladen...</p>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  const canSign = user && (
    isUserSigner(user, document.signers) ||
    (document.owner === user.email && 
     !isUserSigner(user, document.signers))
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
                Zurück
              </Button>
              
              {isSharedView && (
                <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md">
                  Sie betrachten ein geteiltes Dokument
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{document.title}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    {document.status === "completed" ? (
                      <>
                        <FileCheck className="h-4 w-4 text-green-500" />
                        <Badge variant="outline" className="text-green-500 border-green-300">Abgeschlossen</Badge>
                      </>
                    ) : document.status === "awaiting_signatures" ? (
                      <>
                        <Clock className="h-4 w-4 text-amber-500" />
                        <Badge variant="outline" className="text-amber-500 border-amber-300">Warte auf Unterschriften</Badge>
                      </>
                    ) : (
                      <>
                        <FilePen className="h-4 w-4 text-gray-500" />
                        <Badge variant="outline" className="text-gray-500 border-gray-300">Entwurf</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Teilen
                  </Button>
                  {user && document.owner === user.email && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Dokument löschen</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dies wird "{document.title}" und alle zugehörigen Unterschriften dauerhaft löschen.
                            Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDeleteDocument}
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative">
                {isSignatureMode ? (
                  <Card className="h-[600px] flex flex-col items-center justify-between bg-gray-50 p-6">
                    <div className="w-full text-center mb-4">
                      <h3 className="text-lg font-medium">Dokument unterschreiben</h3>
                      <p className="text-gray-500">Bitte zeichnen Sie Ihre Unterschrift unten</p>
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
                        Löschen
                      </Button>
                      <Button 
                        className="bg-housesign-600 hover:bg-housesign-700"
                        onClick={handleSignDocument}
                      >
                        Unterschrift abschließen
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="h-[600px] relative">
                    <PDFViewer 
                      file={pdfUrl}
                      fallback={
                        <Card className="h-full flex items-center justify-center bg-gray-50">
                          <CardContent className="p-0 w-full h-full flex flex-col items-center justify-center">
                            <FilePen className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">Keine Dokumentvorschau verfügbar</p>
                            <p className="text-sm text-gray-400 mt-2">Bitte laden Sie ein PDF-Dokument hoch</p>
                          </CardContent>
                        </Card>
                      }
                    />
                    
                    {document.signingFields && document.signingFields.map((field) => (
                      <SignatureField
                        key={field.id}
                        field={field}
                        onSign={handleSignField}
                        onRevoke={handleRevokeSignature}
                        canSign={canSign}
                        isSigned={field.signedBy !== null}
                        signerName={getSignerName(field)}
                        signatureTimestamp={getSignerTimestamp(field)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Tabs defaultValue="details">
                  <TabsList className="w-full">
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1">Aktivität</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Dokumenttitel</h3>
                            <p className="font-medium">{document.title}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Status</h3>
                            <p className="font-medium">
                              {document.status === "completed" ? "Abgeschlossen" : 
                               document.status === "awaiting_signatures" ? "Warte auf Unterschriften" : 
                               "Entwurf"}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Erstellt</h3>
                            <p className="font-medium">{document.updatedAt?.toLocaleDateString() || 'N/A'}</p>
                          </div>

                          {document.owner && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Besitzer</h3>
                              <p className="font-medium">{document.owner === user?.email ? 'Sie' : document.owner}</p>
                            </div>
                          )}

                          {document.signingFields && document.signingFields.length > 0 && (
                            <div>
                              <h3 className="text-sm font-medium text-gray-500">Unterschriftenfelder</h3>
                              <p className="text-sm">{document.signingFields.length} Feld{document.signingFields.length !== 1 ? 'er' : ''} definiert</p>
                              <p className="text-sm">{document.signingFields.filter(f => f.signedBy !== null).length} von {document.signingFields.length} unterschrieben</p>
                            </div>
                          )}
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Unterzeichner</h3>
                            {document.signers.map((signer, i) => (
                              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                  <p className="font-medium">{getSignerName(signer)}</p>
                                  <p className="text-sm text-gray-500">{getSignerEmail(signer)}</p>
                                </div>
                                <div>
                                  {getSignerStatus(signer) === "signed" ? (
                                    <Badge variant="outline" className="text-green-500 border-green-300">Unterschrieben</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-500 border-amber-300">Ausstehend</Badge>
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
                                    <p className="font-medium">Dokument abgeschlossen</p>
                                    <p className="text-sm text-gray-500">Alle Parteien haben unterschrieben</p>
                                    <p className="text-xs text-gray-400 mt-1">April 3, 2025, 10:30 AM</p>
                                  </div>
                                </div>
                                {document.signers.map((signer, i) => (
                                  <div key={i} className="flex">
                                    <div className="mt-1 mr-3">
                                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div>
                                      <p className="font-medium">{getSignerName(signer)} hat das Dokument unterschrieben</p>
                                      <p className="text-xs text-gray-400 mt-1">{getSignerTimestamp(signer)?.toLocaleString() || 'N/A'}</p>
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
                                    <p className="font-medium">Dokument zur Unterschrift gesendet</p>
                                    <p className="text-sm text-gray-500">Warte auf Unterschriften</p>
                                    <p className="text-xs text-gray-400 mt-1">April 2, 2025, 3:15 PM</p>
                                  </div>
                                </div>
                                {document.signers.map((signer, i) => (
                                  <div key={i} className="flex">
                                    <div className="mt-1 mr-3">
                                      <div className={`h-2 w-2 ${getSignerStatus(signer) === "signed" ? "bg-green-500" : "bg-gray-300"} rounded-full`}></div>
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {getSignerStatus(signer) === "signed" 
                                          ? `${getSignerName(signer)} hat das Dokument unterschrieben` 
                                          : `Warte auf ${getSignerName(signer)}`}
                                      </p>
                                      {getSignerTimestamp(signer) && (
                                        <p className="text-xs text-gray-400 mt-1">{getSignerTimestamp(signer)?.toLocaleString()}</p>
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
                                  <p className="font-medium">Dokument erstellt</p>
                                  <p className="text-sm text-gray-500">Als Entwurf gespeichert</p>
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
                    Dokument bearbeiten
                  </Button>
                )}
                
                {(document.status === "awaiting_signatures" || document.status === "draft") && (
                  <>
                    {canSign && (!document.signingFields || document.signingFields.length === 0) && (
                      <Button 
                        className="w-full mt-4 bg-housesign-600 hover:bg-housesign-700"
                        onClick={handleSignStart}
                      >
                        <Signature className="h-4 w-4 mr-2" />
                        Dokument unterschreiben
                      </Button>
                    )}
                    {document.status === "awaiting_signatures" && (
                      <Button className="w-full mt-4" variant="outline">
                        Unterzeichner erinnern
                      </Button>
                    )}
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
