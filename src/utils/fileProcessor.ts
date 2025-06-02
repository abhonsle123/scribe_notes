export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    // Handle text files directly
    if (file.type === 'text/plain') {
      return await file.text();
    }

    // Handle PDF files - improved approach
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
      return `[Image file: ${file.name}]\n\nNote: This appears to be an image file. For best results with medical documents, please:\n1. Use an OCR tool to convert the image to text first\n2. Copy and paste the text content into the notes field below\n3. Or convert the image to a PDF with selectable text\n\nThis will ensure the AI can properly process your discharge summary content.`;
    }

    throw new Error(`Unsupported file type: ${file.type}`);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}: ${error.message}`);
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string for pattern matching
    const decoder = new TextDecoder('latin1'); // Use latin1 for better binary handling
    const pdfString = decoder.decode(uint8Array);
    
    // Look for text objects in PDF structure
    let extractedText = '';
    
    // Method 1: Look for text between BT (Begin Text) and ET (End Text) operators
    const textObjectRegex = /BT\s*(.*?)\s*ET/gs;
    const textMatches = pdfString.match(textObjectRegex);
    
    if (textMatches) {
      for (const match of textMatches) {
        // Extract text from PDF text objects
        const textContent = match.replace(/BT\s*|\s*ET/g, '');
        
        // Look for text strings (enclosed in parentheses or angle brackets)
        const stringMatches = textContent.match(/\((.*?)\)|\<(.*?)\>/g);
        if (stringMatches) {
          for (const stringMatch of stringMatches) {
            const cleanText = stringMatch.replace(/[\(\)<>]/g, '').trim();
            if (cleanText.length > 2 && /[a-zA-Z]/.test(cleanText)) {
              extractedText += cleanText + ' ';
            }
          }
        }
        
        // Also look for Tj operators (show text)
        const tjMatches = textContent.match(/\((.*?)\)\s*Tj/g);
        if (tjMatches) {
          for (const tjMatch of tjMatches) {
            const text = tjMatch.replace(/\((.*?)\)\s*Tj/, '$1').trim();
            if (text.length > 2 && /[a-zA-Z]/.test(text)) {
              extractedText += text + ' ';
            }
          }
        }
      }
    }
    
    // Method 2: Look for stream objects that might contain text
    if (extractedText.length < 50) {
      const streamRegex = /stream\s*(.*?)\s*endstream/gs;
      const streamMatches = pdfString.match(streamRegex);
      
      if (streamMatches) {
        for (const streamMatch of streamMatches) {
          const streamContent = streamMatch.replace(/stream\s*|\s*endstream/g, '');
          
          // Try to find readable text in streams
          const readableText = streamContent.match(/[a-zA-Z][a-zA-Z0-9\s.,;:!?()-]{10,}/g);
          if (readableText) {
            extractedText += readableText.join(' ') + ' ';
          }
        }
      }
    }
    
    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\x20-\x7E\s]/g, '') // Remove non-printable characters
      .trim();
    
    // Check if we got meaningful text
    if (extractedText.length > 100 && extractedText.split(' ').length > 10) {
      return `PDF Content from ${file.name}:\n\n${extractedText}`;
    } else {
      // If extraction failed, provide helpful guidance
      return `[PDF file: ${file.name}]\n\nUnable to extract readable text from this PDF. This could be because:\n\n1. **Scanned Document**: The PDF contains images of text rather than selectable text\n2. **Complex Format**: The PDF uses a format that requires specialized parsing\n3. **Password Protected**: The PDF is encrypted or password protected\n\n**To proceed, please try one of these options:**\n\n✅ **Option 1 (Recommended)**: Copy and paste the text directly\n- Open the PDF in a PDF viewer\n- Select all text (Ctrl/Cmd + A)\n- Copy the text (Ctrl/Cmd + C)\n- Paste it into the "Additional Notes" field below\n\n✅ **Option 2**: Convert to text file\n- Use a PDF-to-text converter tool\n- Save as a .txt file and upload that instead\n\n✅ **Option 3**: For scanned documents\n- Use an OCR tool to convert the scanned text\n- Then copy and paste the result\n\nThis will ensure the AI can properly analyze your discharge summary.`;
    }
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
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
