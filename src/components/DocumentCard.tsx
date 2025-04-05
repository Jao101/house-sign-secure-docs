
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileCheck, FilePen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface Document {
  id: string;
  title: string;
  status: "draft" | "awaiting_signatures" | "completed";
  updatedAt: Date;
  signers: string[] | { email: string; name: string; status: string; timestamp: Date | null }[];
  fileId?: string;
  owner?: string; // Added owner to track who created the document
}

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{document.title}</h3>
          {document.status === "completed" ? (
            <Badge variant="outline" className="text-green-500 border-green-300">
              <FileCheck className="h-4 w-4 mr-2" />
              Completed
            </Badge>
          ) : document.status === "awaiting_signatures" ? (
            <Badge variant="outline" className="text-amber-500 border-amber-300">
              <Clock className="h-4 w-4 mr-2" />
              Awaiting Signatures
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500 border-gray-300">
              <FilePen className="h-4 w-4 mr-2" />
              Draft
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Updated: {document.updatedAt.toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">
          Signers: {document.signers.length}
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button asChild>
          <Link to={`/document/${document.id}`}>
            View Document <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
