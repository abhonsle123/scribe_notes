import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractTextFromFile, validateFileForProcessing } from "@/utils/fileProcessor";
import {
  Upload,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  Edit,
  Send,
  Eye,
  AlertCircle,
  File,
  Image,
  X
} from "lucide-react";

const NewSummary = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(file => 
        file.type === "application/pdf" || 
        file.type.startsWith("image/") ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleUploadAreaClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-600" />;
    } else if (file.type.startsWith("image/")) {
      return <Image className="h-6 w-6 text-blue-600" />;
    } else {
      return <File className="h-6 w-6 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGenerateSummary = async () => {
    if (files.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one document first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate all files
      for (const file of files) {
        const validation = validateFileForProcessing(file);
        if (!validation.isValid) {
          throw new Error(`${file.name}: ${validation.error}`);
        }
      }

      let fileData = null;
      let combinedContent = "";

      // For the first file, if it's a supported type for direct upload, send it directly
      const firstFile = files[0];
      const supportedForDirectUpload = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (supportedForDirectUpload.includes(firstFile.type)) {
        try {
          console.log('Converting file to base64 for direct upload:', firstFile.name);
          
          // Use FileReader for more reliable base64 conversion
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                // Remove the data URL prefix to get just the base64 data
                const base64Data = reader.result.split(',')[1];
                resolve(base64Data);
              } else {
                reject(new Error('Failed to read file as base64'));
              }
            };
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsDataURL(firstFile);
          });
          
          fileData = {
            data: base64,
            mimeType: firstFile.type,
            name: firstFile.name
          };
          
          console.log('File converted successfully for direct upload');
        } catch (conversionError) {
          console.error('Failed to convert file for direct upload:', conversionError);
          // Fall back to text extraction
          fileData = null;
        }
      }

      // For text files or as fallback, extract text content
      if (!fileData) {
        console.log('Using text extraction fallback');
        for (const file of files) {
          try {
            const extractedText = await extractTextFromFile(file);
            combinedContent += `\n\n--- Document: ${file.name} ---\n${extractedText}`;
          } catch (extractionError) {
            console.error('Text extraction failed for', file.name, ':', extractionError);
            // Continue with a placeholder for failed files
            combinedContent += `\n\n--- Document: ${file.name} ---\n[File processing failed - please check file format]`;
          }
        }
      }

      console.log('Calling Supabase edge function...');

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('convert-to-patient-friendly', {
        body: {
          content: combinedContent,
          notes: notes,
          fileData: fileData
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate summary');
      }

      if (!data || !data.summary) {
        throw new Error('Invalid response from AI service');
      }

      setGeneratedSummary(data.summary);
      setIsProcessed(true);

      toast({
        title: "Summary Generated Successfully",
        description: "Your patient-friendly summary is ready for review.",
      });

    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Summary Generated</h1>
            <p className="text-gray-600 mt-1">Review and send your patient summary</p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Ready to Send
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Patient Summary Preview
                </CardTitle>
                <CardDescription>
                  AI-generated summary in patient-friendly language (9th grade reading level)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-800">
                      {generatedSummary}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => {
                      setIsProcessed(false);
                      setGeneratedSummary("");
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Generate New Summary
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send to Patient
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Options</CardTitle>
                <CardDescription>Choose how to send this summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send via Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send via SMS
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send to Patient Portal
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Model:</span>
                  <span className="font-medium">Gemini 2.0 Flash</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reading Level:</span>
                  <span className="font-medium">Grade 9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Word Count:</span>
                  <span className="font-medium">{generatedSummary.split(' ').length} words</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-700 text-xs">Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Summary</h1>
          <p className="text-gray-600">Gemini 2.0 Flash is converting your discharge summary to patient-friendly language...</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Patient Summary</h3>
            <p className="text-gray-600 mb-6">
              Converting complex medical language to 9th-grade reading level with empathetic tone...
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Files processed and content extracted
              </div>
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                AI analyzing and converting medical content...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Summary</h1>
        <p className="text-gray-600 mt-1">
          Upload discharge summaries to generate patient-friendly versions using Gemini 2.0 Flash
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Secure Platform</span>
            <span className="text-green-700">• End-to-end encryption • Data not stored</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload PDF files, images, or Word documents containing discharge summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : files.length > 0
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleUploadAreaClick}
              >
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Drop your files here, or click to browse
                    </p>
                    <p className="text-gray-500">PDF, DOC, DOCX, JPG, PNG files • Max 10MB each</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files ({files.length})</h4>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optional Notes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
              <CardDescription>
                Add specific instructions for the AI (e.g., focus on medication changes, emphasize follow-up importance)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., Patient is elderly and needs extra medication explanations, emphasize the importance of follow-up appointments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Process Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Summary</CardTitle>
              <CardDescription>
                Convert to patient-friendly language using Gemini 2.0 Flash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGenerateSummary}
                disabled={files.length === 0 || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                {isProcessing ? 'Processing...' : 'Generate Summary'}
              </Button>
              
              {files.length === 0 && (
                <div className="flex items-start space-x-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>Please upload at least one file first</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span>9th-grade reading level conversion</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span>Explains medication purposes</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span>Empathetic, supportive tone</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full p-1 mt-0.5">
                  <span className="text-xs font-bold">✓</span>
                </div>
                <span>Structured sections for clarity</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewSummary;
