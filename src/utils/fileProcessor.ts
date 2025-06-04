
export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    // Handle text files directly
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // For PDF files - skip client-side extraction, let the AI handle it
    if (file.type === 'application/pdf') {
      return `[PDF file: ${file.name}]\n\nThis PDF will be processed directly by the AI. The AI can handle complex PDFs with images, tables, and formatting automatically.`;
    }

    // Handle Word documents - basic text extraction
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.type === 'application/msword') {
      return await extractTextFromWord(file);
    }

    // Handle images - prompt user to use OCR tools or convert to text
    if (file.type.startsWith('image/')) {
      return `[Image file: ${file.name}]\n\nNote: This appears to be an image file. For best results with medical documents, please:\n1. Use an OCR tool to convert the image to text first\n2. Copy and paste the text content into the notes field below\n3. Or convert the image to a PDF with selectable text\n\nThis will ensure the AI can properly process your discharge summary content.`;
    }

    throw new Error(`Unsupported file type: ${file.type}`);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
  }
};

const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Try to extract text from Word document structure
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const docString = decoder.decode(uint8Array);
    
    let extractedText = '';
    
    // If it's a .docx file (XML-based), look for text content
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Look for text between XML tags, specifically <w:t> tags for Word
      const textMatches = docString.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
      if (textMatches) {
        for (const match of textMatches) {
          const text = match.replace(/<w:t[^>]*>|<\/w:t>/g, '').trim();
          if (text.length > 0 && /[a-zA-Z]/.test(text)) {
            extractedText += text + ' ';
          }
        }
      }
      
      // Also try generic XML text content
      if (extractedText.length < 50) {
        const genericMatches = docString.match(/>([^<>]+)</g);
        if (genericMatches) {
          for (const match of genericMatches) {
            const text = match.replace(/^>|<$/g, '').trim();
            if (text.length > 3 && /[a-zA-Z]/.test(text) && 
                !text.includes('<?xml') && !text.includes('xmlns') && 
                !text.includes('w:') && !text.includes('r:')) {
              extractedText += text + ' ';
            }
          }
        }
      }
    } else {
      // For .doc files, try to find readable text patterns
      const readableText = docString.match(/[a-zA-Z][a-zA-Z0-9\s.,;:!?()-]{20,}/g);
      if (readableText) {
        extractedText = readableText.join(' ');
      }
    }
    
    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, '')
      .trim();
    
    if (extractedText.length > 50 && extractedText.split(' ').length > 10) {
      return `Word Document Content from ${file.name}:\n\n${extractedText}`;
    } else {
      return `[Word Document: ${file.name}]\n\nUnable to extract readable text from this Word document.\n\n**To proceed, please:**\n\n✅ **Copy and paste the text directly**\n- Open the Word document\n- Select all text (Ctrl/Cmd + A)\n- Copy the text (Ctrl/Cmd + C) \n- Paste it into the "Additional Notes" field below\n\n✅ **Save as text file**\n- In Word, go to File > Save As\n- Choose "Plain Text (*.txt)" format\n- Upload the .txt file instead\n\nThis will ensure the AI can properly process your discharge summary content.`;
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
