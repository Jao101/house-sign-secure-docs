
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SigningField } from "@/components/DocumentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Signature, SignatureIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { Document, Page, pdfjs } from "react-pdf";
import DraggableSigningField from "./DraggableSigningField";
import { ScrollArea } from "@/components/ui/scroll-area";

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface SigningFieldsEditorProps {
  fields: SigningField[];
  onChange: (fields: SigningField[]) => void;
  pdfUrl: string | null;
}

const SigningFieldsEditor: React.FC<SigningFieldsEditorProps> = ({
  fields,
  onChange,
  pdfUrl
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.0);
  const { toast } = useToast();
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfLoaded(true);
  };
  
  useEffect(() => {
    // Get PDF dimensions when a page loads
    const updatePdfDimensions = () => {
      if (pdfContainerRef.current) {
        const pdfPage = pdfContainerRef.current.querySelector('.react-pdf__Page');
        if (pdfPage) {
          const { width, height } = pdfPage.getBoundingClientRect();
          setPdfDimensions({ width, height });
        }
      }
    };
    
    // Wait a bit for PDF to render
    if (pdfLoaded) {
      const timer = setTimeout(updatePdfDimensions, 500);
      return () => clearTimeout(timer);
    }
  }, [pdfLoaded, currentPage, scale]);
  
  const handleAddField = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (fields.length >= 5) {
      toast({
        title: "Maximum fields reached",
        description: "You can add up to 5 signing fields per document",
        variant: "destructive",
      });
      return;
    }
    
    if (pdfContainerRef.current && pdfLoaded) {
      const rect = pdfContainerRef.current.getBoundingClientRect();
      
      // Calculate drop position relative to the PDF container
      const dropX = e.clientX - rect.left;
      const dropY = e.clientY - rect.top;
      
      // Convert to PDF coordinates by dividing by scale
      const pdfX = dropX / scale;
      const pdfY = dropY / scale;
      
      // Default field dimensions
      const fieldWidth = 200;
      const fieldHeight = 50;
      
      // Create new field centered at the drop position
      const newField: SigningField = {
        id: uuidv4(),
        x: Math.max(0, pdfX - fieldWidth/2),
        y: Math.max(0, pdfY - fieldHeight/2),
        width: fieldWidth,
        height: fieldHeight,
        page: currentPage,
        signedBy: null,
      };
      
      onChange([...fields, newField]);
      
      toast({
        title: "Signature field added",
        description: "Drag to reposition or resize the field as needed",
      });
    }
    
    setIsDraggingNew(false);
  };
  
  const handleUpdateField = (updatedField: SigningField) => {
    onChange(
      fields.map(field => field.id === updatedField.id ? updatedField : field)
    );
  };
  
  const handleRemoveField = (id: string) => {
    onChange(fields.filter(field => field.id !== id));
    
    toast({
      title: "Signature field removed",
      description: "The field has been deleted",
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleSignatureFieldDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("application/x-signature-field", "new");
    e.dataTransfer.effectAllowed = "copy";
    setIsDraggingNew(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Signing Fields (max 5)</Label>
        <div className="text-sm text-gray-500">
          {fields.length}/5 fields
        </div>
      </div>
      
      <div className="flex items-center justify-start mb-4 p-2 border rounded-md bg-gray-50">
        <div className="text-sm mr-4">Drag to add:</div>
        <div
          className="w-48 h-12 bg-amber-50 border-2 border-dashed border-amber-500 rounded flex items-center justify-center cursor-grab"
          draggable
          onDragStart={handleSignatureFieldDragStart}
        >
          <SignatureIcon className="h-4 w-4 text-amber-600 mr-2" />
          <span className="text-amber-600 text-sm font-medium">Signature Field</span>
        </div>
      </div>
      
      {pdfUrl ? (
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[500px] border rounded-md">
              <div
                className="relative"
                ref={pdfContainerRef}
                onDragOver={handleDragOver}
                onDrop={handleAddField}
              >
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                
                {fields
                  .filter(field => field.page === currentPage)
                  .map(field => (
                    <DraggableSigningField
                      key={field.id}
                      field={field}
                      onChange={handleUpdateField}
                      onDelete={handleRemoveField}
                      containerRef={pdfContainerRef}
                      pageScale={scale}
                      pdfDimensions={pdfDimensions}
                    />
                  ))
                }
              </div>
            </ScrollArea>
            
            {numPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous Page
                </Button>
                <span>
                  Page {currentPage} of {numPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= numPages}
                  onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                >
                  Next Page
                </Button>
              </div>
            )}
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              >
                Zoom Out
              </Button>
              <Button
                variant="outline"
                onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
              >
                Zoom In
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <Signature className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Upload a PDF document to add signing fields</p>
            <p className="text-sm text-gray-400">
              Drag and drop signature fields onto the document
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SigningFieldsEditor;
