
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
