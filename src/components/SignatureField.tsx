
import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Signature } from "lucide-react";
import { SigningField } from "@/components/DocumentCard";

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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
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
    const canvas = canvasRef.current;
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
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };
  
  const handleComplete = () => {
    if (!canvasRef.current) return;
    
    const signatureData = canvasRef.current.toDataURL('image/png');
    onSign(field.id, signatureData);
    setIsSignatureMode(false);
  };

  if (isSignatureMode) {
    return (
      <Card className="absolute p-4 bg-white shadow-lg border" style={{
        left: `${field.x}px`,
        top: `${field.y}px`,
        width: `${field.width}px`,
        height: `${field.height + 100}px`,
        zIndex: 50
      }}>
        <div className="flex flex-col h-full">
          <h4 className="text-sm font-medium mb-2">Sign here</h4>
          <div className="flex-1 border border-dashed border-gray-300 mb-4">
            <canvas 
              ref={canvasRef}
              width={field.width - 10}
              height={field.height}
              className="border border-gray-200"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button size="sm" onClick={handleComplete}>
              Done
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="absolute border-2 border-dashed" style={{
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
            <div className="text-xs text-gray-500">Signature verified</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          {canSign ? (
            <Button 
              variant="ghost" 
              className="text-amber-500" 
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
