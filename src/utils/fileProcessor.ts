
export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    // Handle text files directly
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // Handle PDF files
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    }

    // Handle Word documents
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword') {
      return await extractTextFromWord(file);
    }

    // Handle images (basic OCR simulation)
    if (file.type.startsWith('image/')) {
      return `[Image uploaded: ${file.name}. Please note: Image text extraction is limited. For best results, please convert your image to a PDF or text document before uploading.]`;
    }

    throw new Error(`Unsupported file type: ${file.type}`);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Simple PDF text extraction using built-in browser APIs
    const arrayBuffer = await file.arrayBuffer();
    
    // For demonstration purposes, we'll return a placeholder
    // In a real implementation, you'd use a PDF parsing library
    return `[PDF Content from ${file.name}]\n\nNote: This is a placeholder for PDF text extraction. The actual content would be extracted using a PDF parsing library. Please ensure your PDF contains selectable text for best results.`;
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    // Word document extraction would require a specialized library
    return `[Word Document Content from ${file.name}]\n\nNote: This is a placeholder for Word document text extraction. The actual content would be extracted using a document parsing library.`;
  } catch (error) {
    throw new Error(`Failed to process Word document: ${error.message}`);
  }
};

export const validateFileForProcessing = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not supported' };
  }

  return { isValid: true };
};
