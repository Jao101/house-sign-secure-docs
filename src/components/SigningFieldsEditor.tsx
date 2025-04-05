
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SigningField } from "@/components/DocumentCard";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Signature } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
  
  const handleAddField = () => {
    if (fields.length >= 5) {
      toast({
        title: "Maximum fields reached",
        description: "You can add up to 5 signing fields per document",
        variant: "destructive",
      });
      return;
    }
    
    const newField: SigningField = {
      id: uuidv4(),
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      page: currentPage,
      signedBy: null,
    };
    
    onChange([...fields, newField]);
  };
  
  const handleRemoveField = (id: string) => {
    onChange(fields.filter(field => field.id !== id));
  };
  
  const handleFieldChange = (id: string, key: keyof SigningField, value: any) => {
    onChange(
      fields.map(field => 
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Signing Fields (max 5)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddField}
          disabled={fields.length >= 5}
          className="text-housesign-600 border-housesign-300"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Field
        </Button>
      </div>
      
      {pdfUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            Define where signatures should be placed on the document.
          </p>
        </div>
      )}
      
      {fields.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <Signature className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No signing fields added yet</p>
            <p className="text-sm text-gray-400">
              Add up to 5 signing fields to your document
            </p>
          </CardContent>
        </Card>
      ) : (
        fields.map((field) => (
          <Card key={field.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`field-page-${field.id}`}>Page</Label>
                    <Input
                      id={`field-page-${field.id}`}
                      type="number"
                      min="1"
                      value={field.page}
                      onChange={(e) => handleFieldChange(field.id, "page", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="X"
                        value={field.x}
                        onChange={(e) => handleFieldChange(field.id, "x", parseInt(e.target.value) || 0)}
                      />
                      <Input
                        type="number"
                        placeholder="Y"
                        value={field.y}
                        onChange={(e) => handleFieldChange(field.id, "y", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Size</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Width"
                        value={field.width}
                        onChange={(e) => handleFieldChange(field.id, "width", parseInt(e.target.value) || 100)}
                      />
                      <Input
                        type="number"
                        placeholder="Height"
                        value={field.height}
                        onChange={(e) => handleFieldChange(field.id, "height", parseInt(e.target.value) || 50)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => handleRemoveField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default SigningFieldsEditor;
