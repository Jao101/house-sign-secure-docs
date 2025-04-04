
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Set up the worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  file?: string; // URL to the PDF file
  fallback?: React.ReactNode; // Fallback UI when no file is provided
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, fallback }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1);
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
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex justify-center p-4 min-h-full">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-center py-10">Loading document...</div>}
            error={<div className="text-center py-10 text-red-500">Failed to load PDF</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default PDFViewer;
