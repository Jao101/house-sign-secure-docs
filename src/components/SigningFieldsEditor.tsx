
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SigningField } from "@/components/DocumentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Signature } from "lucide-react";
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
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  const handleAddField = (e: React.MouseEvent<HTMLDivElement>) => {
    if (fields.length >= 5) {
      toast({
        title: "Maximum fields reached",
        description: "You can add up to 5 signing fields per document",
        variant: "destructive",
      });
      return;
    }
    
    // Only add field if clicking directly on the container, not on existing fields
    if (e.currentTarget === e.target && pdfContainerRef.current) {
      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      
      const newField: SigningField = {
        id: uuidv4(),
        x,
        y,
        width: 200,
        height: 50,
        page: currentPage,
        signedBy: null,
      };
      
      onChange([...fields, newField]);
    }
  };
  
  const handleUpdateField = (updatedField: SigningField) => {
    onChange(
      fields.map(field => field.id === updatedField.id ? updatedField : field)
    );
  };
  
  const handleRemoveField = (id: string) => {
    onChange(fields.filter(field => field.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Signing Fields (max 5)</Label>
        <div className="text-sm text-gray-500">
          {fields.length}/5 fields • Click on PDF to add a signature field
        </div>
      </div>
      
      {pdfUrl ? (
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[500px] border rounded-md">
              <div
                className="relative"
                ref={pdfContainerRef}
                onClick={handleAddField}
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
              Add up to 5 signing fields to your document
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SigningFieldsEditor;
