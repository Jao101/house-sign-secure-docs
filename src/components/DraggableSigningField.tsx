
import React, { useState, useRef, useEffect } from "react";
import { SigningField } from "@/components/DocumentCard";
import { useToast } from "@/components/ui/use-toast";

interface DraggableSigningFieldProps {
  field: SigningField;
  onChange: (updatedField: SigningField) => void;
  onDelete: (fieldId: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  pageScale: number;
}

const DraggableSigningField: React.FC<DraggableSigningFieldProps> = ({
  field,
  onChange,
  onDelete,
  containerRef,
  pageScale
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Handle mouse and touch events for dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (fieldRef.current) {
      const rect = fieldRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
    
    setIsDragging(true);
  };
  
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
  };
  
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isResizing) return;
      
      let clientX, clientY;
      if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (isDragging) {
          // Calculate new position within container bounds
          let newX = (clientX - containerRect.left - dragOffset.x) / pageScale;
          let newY = (clientY - containerRect.top - dragOffset.y) / pageScale;
          
          // Enforce boundaries
          newX = Math.max(0, Math.min(newX, (containerRect.width / pageScale) - field.width));
          newY = Math.max(0, Math.min(newY, (containerRect.height / pageScale) - field.height));
          
          onChange({
            ...field,
            x: newX,
            y: newY
          });
        }
        
        if (isResizing) {
          // Calculate new width and height based on mouse position
          const newWidth = Math.max(100, (clientX - containerRect.left - field.x * pageScale) / pageScale);
          const newHeight = Math.max(40, (clientY - containerRect.top - field.y * pageScale) / pageScale);
          
          onChange({
            ...field,
            width: newWidth,
            height: newHeight
          });
        }
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, dragOffset, field, onChange, containerRef, pageScale]);
  
  return (
    <div
      ref={fieldRef}
      className="absolute border-2 border-dashed border-amber-500 bg-amber-50 bg-opacity-20 cursor-move"
      style={{
        left: `${field.x * pageScale}px`,
        top: `${field.y * pageScale}px`,
        width: `${field.width * pageScale}px`,
        height: `${field.height * pageScale}px`,
        zIndex: 10
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-amber-600 text-sm font-medium">Signature Field</div>
      </div>
      
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 cursor-se-resize"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      />
      
      <button 
        className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
        onClick={() => onDelete(field.id)}
      >
        ✕
      </button>
    </div>
  );
};

export default DraggableSigningField;
