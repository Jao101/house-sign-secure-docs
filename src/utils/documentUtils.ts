
import { SigningField } from "@/components/DocumentCard";
import { embedSignaturesInPdf } from "@/utils/signatureUtils";

/**
 * Utility functions for document operations
 */

/**
 * Downloads a document as a PDF file with embedded signatures
 * @param documentTitle The title to use for the downloaded file
 * @param fileData The file data (typically a base64 encoded string)
 * @param signingFields The signing fields with signature data to embed
 */
export const downloadDocument = async (
  documentTitle: string, 
  fileData: string | null,
  signingFields?: SigningField[]
): Promise<void> => {
  if (!fileData) {
    console.error("No file data available to download");
    return;
  }
  
  try {
    // Process the PDF to embed signatures
    const processedPdfData = signingFields && signingFields.length > 0
      ? await embedSignaturesInPdf(fileData, signingFields)
      : fileData;
      
    if (!processedPdfData) {
      throw new Error("Failed to process PDF with signatures");
    }
    
    // Create a link element
    const link = document.createElement('a');
    
    // Check if fileData is already a data URL or blob URL
    if (!processedPdfData.startsWith('data:') && !processedPdfData.startsWith('blob:')) {
      // Convert to proper data URL if needed
      const pdfData = `data:application/pdf;base64,${processedPdfData}`;
      link.href = pdfData;
    } else {
      link.href = processedPdfData;
    }
    
    // Set link properties
    link.download = `${documentTitle}.pdf`;
    
    // Append to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};

/**
 * Preserve the original PDF URL
 * This helps prevent accidental replacement with a test PDF
 */
export const preserveOriginalPdfUrl = (currentUrl: string | null): string | null => {
  // Check if the URL is the Mozilla test PDF
  if (currentUrl && currentUrl.includes('tracemonkey-pldi-09')) {
    return null;
  }
  return currentUrl;
};

/**
 * Share a document by generating a link and copying it to clipboard
 * @param documentId The ID of the document to share
 * @returns A success boolean
 */
export const shareDocument = async (documentId: string): Promise<boolean> => {
  try {
    // Get the base URL of the current page
    const baseUrl = window.location.origin;
    
    // Generate the share link
    const shareUrl = `${baseUrl}/document/${documentId}?share=true`;
    
    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (error) {
    console.error("Error sharing document:", error);
    return false;
  }
};

