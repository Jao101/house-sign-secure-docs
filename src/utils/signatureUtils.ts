import { SigningField } from "@/components/DocumentCard";

/**
 * Checks if a field can be signed by the current user
 */
export const canUserSignField = (
  field: SigningField, 
  userEmail: string | null | undefined,
  documentOwner: string | null | undefined,
  signers: Array<{ email: string; status: string }> = []
): boolean => {
  if (!userEmail) return false;
  
  // If field is already signed, it can't be signed again
  if (field.signedBy !== null) return false;
  
  const isOwner = userEmail === documentOwner;
  const isSigner = signers.some(signer => signer.email === userEmail);
  
  return isOwner || isSigner;
};

/**
 * Formats a timestamp for display
 */
export const formatTimestamp = (timestamp: Date | null): string => {
  if (!timestamp) return 'N/A';
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);
};

/**
 * Checks if all fields in a document are signed
 */
export const areAllFieldsSigned = (fields: SigningField[] = []): boolean => {
  if (fields.length === 0) return true;
  return fields.every(field => field.signedBy !== null);
};

/**
 * Gets the display name for a user email
 */
export const getDisplayName = (email: string): string => {
  return email.split('@')[0] || email;
};

/**
 * Check if a signature is within revocation period (5 minutes)
 * @param signatureTimestamp The timestamp when the signature was created
 * @returns boolean indicating if the signature can be revoked
 */
export const canRevokeSignature = (signatureTimestamp: Date | null): boolean => {
  if (!signatureTimestamp) return false;
  
  const currentTime = new Date();
  const timeDifference = currentTime.getTime() - signatureTimestamp.getTime();
  
  // 5 minutes in milliseconds
  const fiveMinutesInMs = 5 * 60 * 1000;
  
  return timeDifference <= fiveMinutesInMs;
};

/**
 * Create a document with signatures embedded
 * @param pdfUrl Base64 or URL of the PDF
 * @param signatures Array of signatures with positions
 * @returns The rendered PDF with embedded signatures
 */
export const embedSignaturesInPdf = async (
  pdfUrl: string | null,
  signingFields: SigningField[] = []
): Promise<string | null> => {
  // In a real application, this would use a PDF manipulation library
  // For this prototype, we'll return the original PDF
  // but in real life the signatures would be embedded
  
  // For demonstration purposes, we're returning the original document
  // In a production app, you would use libraries like pdf-lib to embed 
  // the signatures into the actual PDF document
  
  return pdfUrl;
};

/**
 * Generate a share link for a document
 * @param documentId The ID of the document to share
 * @param baseUrl The base URL of the application
 * @returns A shareable URL
 */
export const generateShareLink = (documentId: string, baseUrl: string): string => {
  // Create a share token (in a real app, this might be a JWT or other secure token)
  const shareToken = `share_${documentId}_${Date.now()}`;
  
  return `${baseUrl}/document/${documentId}?token=${shareToken}`;
};
