
import React from "react";
import { Link } from "react-router-dom";
import { File, FileCheck, Clock, Edit2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export type Document = {
  id: string;
  title: string;
  status: "draft" | "awaiting_signatures" | "completed";
  updatedAt: Date;
  createdAt?: Date; // Make createdAt optional
  signers: string[];
};

const DocumentStatusIcon = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "draft":
      return <Edit2 className="h-4 w-4 text-gray-500" />;
    case "awaiting_signatures":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "completed":
      return <FileCheck className="h-4 w-4 text-green-500" />;
    default:
      return <File className="h-4 w-4" />;
  }
};

const DocumentStatusBadge = ({ status }: { status: Document["status"] }) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline" className="text-gray-500 border-gray-300">Draft</Badge>;
    case "awaiting_signatures":
      return <Badge variant="outline" className="text-amber-500 border-amber-300">Awaiting Signatures</Badge>;
    case "completed":
      return <Badge variant="outline" className="text-green-500 border-green-300">Completed</Badge>;
    default:
      return null;
  }
};

type DocumentCardProps = {
  document: Document;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <Link to={`/document/${document.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-lg truncate">{document.title}</h3>
            <DocumentStatusIcon status={document.status} />
          </div>
          <DocumentStatusBadge status={document.status} />
        </CardContent>
        <CardFooter className="bg-gray-50 justify-between text-sm text-gray-500 border-t p-4">
          <div>Updated {formatDistanceToNow(document.updatedAt, { addSuffix: true })}</div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-xs">
              {document.signers.length} {document.signers.length === 1 ? "signer" : "signers"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DocumentCard;
