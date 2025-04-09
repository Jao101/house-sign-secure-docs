
import React, { useState, useRef, useEffect } from "react";
import { SigningField } from "@/components/DocumentCard";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, GripVertical } from "lucide-react";

interface DraggableSigningFieldProps {
  field: SigningField;
  onChange: (updatedField: SigningField) => void;
  onDelete: (fieldId: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  pageScale: number;
  pdfDimensions: { width: number; height: number };
}

const DraggableSigningField: React.FC<DraggableSigningFieldProps> = ({
  field,
  onChange,
  onDelete,
  containerRef,
  pageScale,
  pdfDimensions
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Handle mouse events for dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'nwse-resize';
  };
  
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (isDragging) {
          // Calculate new position within container bounds
          let newX = (e.clientX - containerRect.left - dragOffset.x) / pageScale;
          let newY = (e.clientY - containerRect.top - dragOffset.y) / pageScale;
          
          // Enforce boundaries
          newX = Math.max(0, Math.min(newX, (pdfDimensions.width / pageScale) - field.width));
          newY = Math.max(0, Math.min(newY, (pdfDimensions.height / pageScale) - field.height));
          
          onChange({
            ...field,
            x: newX,
            y: newY
          });
        }
        
        if (isResizing) {
          // Calculate new width and height based on mouse position
          const newWidth = Math.max(100, (e.clientX - containerRect.left - field.x * pageScale) / pageScale);
          const newHeight = Math.max(40, (e.clientY - containerRect.top - field.y * pageScale) / pageScale);
          
          // Enforce maximum size
          const maxWidth = (pdfDimensions.width / pageScale) - field.x;
          const maxHeight = (pdfDimensions.height / pageScale) - field.y;
          
          onChange({
            ...field,
            width: Math.min(newWidth, maxWidth),
            height: Math.min(newHeight, maxHeight)
          });
        }
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [isDragging, isResizing, dragOffset, field, onChange, containerRef, pageScale, pdfDimensions]);
  
  return (
    <div
      ref={fieldRef}
      className="absolute border-2 border-dashed border-amber-500 bg-amber-50 bg-opacity-20 group"
      style={{
        left: `${field.x * pageScale}px`,
        top: `${field.y * pageScale}px`,
        width: `${field.width * pageScale}px`,
        height: `${field.height * pageScale}px`,
        zIndex: 10
      }}
    >
      {/* Handle for dragging */}
      <div 
        className="absolute top-0 left-0 h-full w-full cursor-grab"
        onMouseDown={handleDragStart}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-amber-600 text-sm font-medium flex items-center">
            <GripVertical className="h-4 w-4 mr-1 opacity-50" />
            Signature Field
          </div>
        </div>
      </div>
      
      {/* Resize handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 cursor-se-resize"
        onMouseDown={handleResizeStart}
      />
      
      {/* Delete button */}
      <button 
        className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(field.id)}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};

export default DraggableSigningField;
