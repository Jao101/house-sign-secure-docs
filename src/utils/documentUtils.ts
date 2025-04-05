
/**
 * Utility functions for document operations
 */

/**
 * Downloads a document as a PDF file
 * @param documentTitle The title to use for the downloaded file
 * @param fileData The file data (typically a base64 encoded string)
 */
export const downloadDocument = (documentTitle: string, fileData: string | null): void => {
  if (!fileData) {
    console.error("No file data available to download");
    return;
  }
  
  try {
    // Create a link element
    const link = document.createElement('a');
    
    // Set link properties
    link.href = fileData;
    link.download = `${documentTitle}.pdf`;
    
    // Append to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};
