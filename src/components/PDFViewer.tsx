
import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Set up the worker source for PDF.js
// Using cdnjs instead of unpkg for better reliability
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file?: string; // URL to the PDF file
  fallback?: React.ReactNode; // Fallback UI when no file is provided
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, fallback }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when file changes
    if (file) {
      setNumPages(null);
      setPageNumber(1);
      setLoadError(false);
      setIsLoading(true);
    }
  }, [file]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
    setLoadError(false);
  }

  function onDocumentLoadError(error: Error): void {
    console.error("PDF load error:", error);
    setIsLoading(false);
    setLoadError(true);
    toast({
      title: "Error loading PDF",
      description: "There was a problem loading the document. Please try again later.",
      variant: "destructive",
    });
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
        return newPageNumber;
      }
      return prevPageNumber;
    });
  }

  function changeScale(delta: number) {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      if (newScale >= 0.5 && newScale <= 2.0) {
        return newScale;
      }
      return prevScale;
    });
  }

  function rotateDocument() {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  }

  if (!file) {
    return fallback || null;
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {pageNumber} / {numPages || '?'}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeScale(-0.1)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => changeScale(0.1)}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={rotateDocument}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex justify-center p-4 min-h-full">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400 mb-4" />
                <p>Loading document...</p>
              </div>
            }
            error={
              <div className="text-center py-10 text-red-500">
                <p className="font-medium mb-2">Failed to load PDF</p>
                <p className="text-sm">The document may be inaccessible or in an unsupported format.</p>
              </div>
            }
          >
            {!isLoading && !loadError && (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Document>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PDFViewer;
