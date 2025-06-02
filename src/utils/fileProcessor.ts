
export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    // Handle text files directly
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // Handle PDF files - extract text using basic approach
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    }

    // Handle Word documents - basic text extraction
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword') {
      return await extractTextFromWord(file);
    }

    // Handle images - prompt user to use OCR tools or convert to text
    if (file.type.startsWith('image/')) {
      return `[Image file: ${file.name}]\n\nNote: This appears to be an image file. For best results with medical documents, please convert images to PDF or text format before uploading. If this image contains text (like a scanned document), consider using an OCR tool to convert it to text first.`;
    }

    throw new Error(`Unsupported file type: ${file.type}`);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // For PDF files, we'll read as text and try to extract readable content
    // This is a basic approach - for production, you'd want a proper PDF parser
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and try to extract text content
    let text = '';
    let textFound = false;
    
    // Look for text streams in PDF
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const pdfString = decoder.decode(uint8Array);
    
    // Basic text extraction - look for readable text patterns
    const textMatches = pdfString.match(/\[([^\]]+)\]/g) || [];
    const streamMatches = pdfString.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];
    
    // Try to find readable text
    for (const match of streamMatches) {
      const streamContent = match.replace(/stream\s*|\s*endstream/g, '');
      const readableText = streamContent.replace(/[^\x20-\x7E\s]/g, '').trim();
      if (readableText.length > 20) {
        text += readableText + '\n';
        textFound = true;
      }
    }
    
    // Also look for direct text patterns
    const directTextMatch = pdfString.match(/BT\s*([\s\S]*?)\s*ET/g);
    if (directTextMatch) {
      for (const match of directTextMatch) {
        const textContent = match.replace(/BT\s*|\s*ET/g, '');
        const cleanText = textContent.replace(/[^\x20-\x7E\s]/g, '').trim();
        if (cleanText.length > 10) {
          text += cleanText + '\n';
          textFound = true;
        }
      }
    }
    
    if (textFound && text.trim().length > 50) {
      return `PDF Content from ${file.name}:\n\n${text.trim()}`;
    } else {
      // If we can't extract meaningful text, ask for a text version
      return `[PDF file: ${file.name}]\n\nNote: Unable to extract readable text from this PDF file. This may be because:\n1. The PDF contains scanned images rather than selectable text\n2. The PDF is password protected or encrypted\n3. The text is in a format that requires specialized PDF parsing\n\nFor best results, please:\n- Ensure the PDF contains selectable text (not just scanned images)\n- Try copying and pasting the text into a .txt file and uploading that instead\n- Or use a PDF-to-text converter tool before uploading`;
    }
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
};

const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    // For Word documents, we'll attempt basic text extraction
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try to extract text from Word document structure
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const docString = decoder.decode(uint8Array);
    
    // Look for readable text patterns in Word XML structure
    let extractedText = '';
    
    // If it's a .docx file (XML-based), look for text content
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Look for text between XML tags
      const textMatches = docString.match(/>([^<>]+)</g);
      if (textMatches) {
        for (const match of textMatches) {
          const text = match.replace(/^>|<$/g, '').trim();
          if (text.length > 3 && /[a-zA-Z]/.test(text) && !text.includes('<?xml')) {
            extractedText += text + ' ';
          }
        }
      }
    } else {
      // For .doc files, try to find readable text
      const readableText = docString.replace(/[^\x20-\x7E\s]/g, '').trim();
      extractedText = readableText;
    }
    
    if (extractedText.trim().length > 50) {
      return `Word Document Content from ${file.name}:\n\n${extractedText.trim()}`;
    } else {
      return `[Word Document: ${file.name}]\n\nNote: Unable to extract readable text from this Word document. For best results, please:\n1. Copy the text from the Word document and paste it into a .txt file\n2. Save the Word document as a PDF with selectable text\n3. Or copy and paste the content directly into the notes field below\n\nThis will ensure the AI can properly process your discharge summary content.`;
    }
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
