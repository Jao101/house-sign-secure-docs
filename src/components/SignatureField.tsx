
import React, { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Signature, Check, X } from "lucide-react";
import { SigningField } from "@/components/DocumentCard";
import { useToast } from "@/components/ui/use-toast";

interface SignatureFieldProps {
  field: SigningField;
  onSign: (fieldId: string, signatureData: string) => void;
  canSign: boolean;
  isSigned: boolean;
  signerName?: string;
}

const SignatureField: React.FC<SignatureFieldProps> = ({ 
  field, 
  onSign, 
  canSign,
  isSigned,
  signerName
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const { toast } = useToast();

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.strokeStyle = '#1e3a8a';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const rect = canvas.getBoundingClientRect();
    context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    context.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
      }
    }
  };
  
  const handleComplete = () => {
    if (!canvasRef.current) return;
    
    if (!hasDrawn) {
      toast({
        title: "Signature required",
        description: "Please sign before completing",
        variant: "destructive",
      });
      return;
    }
    
    const signatureData = canvasRef.current.toDataURL('image/png');
    onSign(field.id, signatureData);
    setIsSignatureMode(false);
    
    toast({
      title: "Field signed successfully",
      description: "Your signature has been applied"
    });
  };

  const handleCancel = () => {
    setIsSignatureMode(false);
    setHasDrawn(false);
  };

  if (isSignatureMode) {
    return (
      <Card className="absolute p-4 bg-white shadow-lg border z-50" style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${Math.max(field.width, 300)}px`,
        minHeight: `${field.height + 100}px`,
      }}>
        <div className="flex flex-col h-full">
          <h4 className="text-sm font-medium mb-2">Sign here</h4>
          <div className="flex-1 border border-dashed border-gray-300 mb-4 bg-gray-50 flex items-center justify-center">
            <canvas 
              ref={canvasRef}
              width={Math.max(field.width - 10, 280)}
              height={field.height}
              className="border border-gray-200 bg-white cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="text-xs text-gray-500 mb-3 text-center">
            Draw your signature above using your mouse
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleComplete} disabled={!hasDrawn}>
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="absolute border-2 border-dashed transition-colors" style={{
      left: `${field.x}px`,
      top: `${field.y}px`,
      width: `${field.width}px`,
      height: `${field.height}px`,
      borderColor: isSigned ? '#10b981' : canSign ? '#f59e0b' : '#e5e7eb',
      backgroundColor: isSigned ? 'rgba(16, 185, 129, 0.1)' : canSign ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
    }}>
      {isSigned ? (
        <div className="flex items-center justify-center h-full p-2">
          <div className="text-center">
            <div className="text-green-600 font-signature text-xl">{signerName || 'Signed'}</div>
            <div className="text-xs text-green-600 flex items-center justify-center">
              <Check className="h-3 w-3 mr-1" />
              Signature verified
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          {canSign ? (
            <Button 
              variant="ghost" 
              className="text-amber-500 hover:bg-amber-50" 
              onClick={() => setIsSignatureMode(true)}
            >
              <Signature className="h-4 w-4 mr-2" />
              Sign Here
            </Button>
          ) : (
            <div className="text-center text-gray-400 text-sm p-2">
              <Signature className="h-4 w-4 mx-auto mb-1" />
              Signature Required
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureField;
