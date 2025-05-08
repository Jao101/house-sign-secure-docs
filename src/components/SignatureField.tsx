import React, { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Signature, Check, X, Trash2 } from "lucide-react";
import { SigningField } from "@/components/DocumentCard";
import { useToast } from "@/components/ui/use-toast";
import { canRevokeSignature } from "@/utils/signatureUtils";

interface SignatureFieldProps {
  field: SigningField;
  onSign: (fieldId: string, signatureData: string) => void;
  onRevoke?: (fieldId: string) => void;
  canSign: boolean;
  isSigned: boolean;
  signerName?: string;
  signatureTimestamp?: Date | null;
}

const SignatureField: React.FC<SignatureFieldProps> = ({ 
  field, 
  onSign, 
  onRevoke,
  canSign,
  isSigned,
  signerName,
  signatureTimestamp
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const { toast } = useToast();
  const [canDelete, setCanDelete] = useState(false);

  // Check if signature can be revoked (within 5 minutes)
  useEffect(() => {
    if (isSigned && signatureTimestamp) {
      setCanDelete(canRevokeSignature(signatureTimestamp));
      
      // Set up a timer to update canDelete status
      const timer = setInterval(() => {
        setCanDelete(canRevokeSignature(signatureTimestamp));
      }, 10000); // check every 10 seconds
      
      return () => clearInterval(timer);
    }
    return undefined;
  }, [isSigned, signatureTimestamp]);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
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
    context.lineWidth = 2.5;
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
        setHasDrawn(false);
      }
    }
  };
  
  const handleComplete = () => {
    if (!canvasRef.current) return;
    
    if (!hasDrawn) {
      toast({
        title: "Signatur erforderlich",
        description: "Bitte unterschreiben Sie vor dem Abschließen",
        variant: "destructive",
      });
      return;
    }
    
    const signatureData = canvasRef.current.toDataURL('image/png');
    onSign(field.id, signatureData);
    setIsSignatureMode(false);
    
    toast({
      title: "Feld erfolgreich unterschrieben",
      description: "Ihre Unterschrift wurde hinzugefügt"
    });
  };

  const handleCancel = () => {
    setIsSignatureMode(false);
    setHasDrawn(false);
  };
  
  const handleRevoke = () => {
    if (onRevoke) {
      onRevoke(field.id);
      
      toast({
        title: "Unterschrift zurückgezogen",
        description: "Ihre Unterschrift wurde entfernt"
      });
    }
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
          <h4 className="text-sm font-medium mb-2">Hier unterschreiben</h4>
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
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="text-xs text-gray-500 mb-3 text-center">
            Zeichnen Sie Ihre Unterschrift oben mit der Maus
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Löschen
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Abbrechen
            </Button>
            <Button size="sm" onClick={handleComplete} disabled={!hasDrawn}>
              <Check className="h-4 w-4 mr-1" />
              Unterschreiben
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
        <div className="flex items-center justify-center h-full p-2 relative">
          <div className="text-center w-full">
            {field.signatureImageData ? (
              <img 
                src={field.signatureImageData} 
                alt="Signature" 
                className="max-h-full max-w-full mx-auto object-contain"
              />
            ) : (
              <div className="text-green-600 font-signature text-xl">{signerName || 'Unterschrieben'}</div>
            )}
            <div className="text-xs text-green-600 flex items-center justify-center mt-1">
              <Check className="h-3 w-3 mr-1" />
              Unterschrift bestätigt
            </div>
          </div>
          
          {canDelete && onRevoke && (
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full border-red-200 bg-white hover:bg-red-50 text-red-500"
              onClick={handleRevoke}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
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
              Hier unterschreiben
            </Button>
          ) : (
            <div className="text-center text-gray-400 text-sm p-2">
              <Signature className="h-4 w-4 mx-auto mb-1" />
              Unterschrift erforderlich
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignatureField;
