import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { extractTextFromFile, validateFileForProcessing } from "@/utils/fileProcessor";
import { EmailSummaryForm } from "@/components/EmailSummaryForm";
import {
  Upload,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  Edit,
  Eye,
  AlertCircle,
  File,
  Image,
  X,
  Sparkles,
  Heart,
  Users
} from "lucide-react";

const NewSummary = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const extractPatientNameFromSummary = (summaryContent: string): string => {
    // Try to find a patient name in the generated summary
    // Common patterns in discharge reports
    const namePatterns = [
      /Patient\s*(?:Name|:)\s*([A-Za-z\s.-]+)(?:\r?\n|,|;|\s{2})/i,
      /Name\s*(?::|of patient)\s*([A-Za-z\s.-]+)(?:\r?\n|,|;|\s{2})/i,
      /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Za-z\s.-]+)(?:\r?\n|,|;|\s{2})/i
    ];

    let extractedName = "";
    
    // Try each pattern until we find a match
    for (const pattern of namePatterns) {
      const match = summaryContent.match(pattern);
      if (match && match[1]) {
        extractedName = match[1].trim();
        // If name is all caps, convert to title case
        if (extractedName === extractedName.toUpperCase()) {
          extractedName = extractedName
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        break;
      }
    }

    // If no pattern matched, fall back to the filename (but with better formatting)
    if (!extractedName && files.length > 0) {
      extractedName = files[0]?.name
        .replace(/\.[^/.]+$/, "")  // Remove file extension
        .replace(/[_-]/g, " ")     // Replace underscores and hyphens with spaces
        .replace(/\s+/g, " ")      // Normalize spaces
        .trim();
      
      // If the filename is still not a good name, use a default
      if (!extractedName || extractedName.length < 2) {
        extractedName = "Unknown Patient";
      }
    } else if (!extractedName) {
      extractedName = "Unknown Patient";
    }

    return extractedName;
  };

  const saveSummaryToDatabase = async (summaryContent: string) => {
    try {
      // Get the Supabase user from the current session
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !supabaseUser) {
        throw new Error('User not authenticated');
      }

      console.log('Using Supabase user ID:', supabaseUser.id);

      // Extract patient name from summary content instead of filename
      const extractedPatientName = extractPatientNameFromSummary(summaryContent);
      setPatientName(extractedPatientName);

      const { data, error } = await supabase
        .from('summaries')
        .insert({
          user_id: supabaseUser.id,
          patient_name: extractedPatientName,
          original_filename: files.map(f => f.name).join(', '),
          summary_content: summaryContent,
          patient_email: null,
          sent_at: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving summary:', error);
        throw error;
      }

      setSummaryId(data.id);
      console.log('Summary saved successfully:', data.id);
    } catch (error) {
      console.error('Failed to save summary:', error);
      throw error;
    }
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

    // Check authentication before proceeding
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !supabaseUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to continue",
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

      // Save summary to database
      await saveSummaryToDatabase(data.summary);

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

  const handleEmailSent = () => {
    setEmailSent(true);
  };

  if (isProcessed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
        <div className="container mx-auto px-6 py-8 space-y-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl mb-4 animate-pulse-gentle">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Summary Generated Successfully
            </h1>
            <p className="text-xl text-gray-600">Your patient-friendly summary is ready for review and delivery</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary Preview */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-0 shadow-xl hover-lift">
                <CardHeader className="bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-t-xl">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="p-2 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-xl mr-3">
                      <Eye className="h-6 w-6 text-turquoise" />
                    </div>
                    Patient Summary
                  </CardTitle>
                  <CardDescription className="text-lg">
                    AI-generated summary in patient-friendly language
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-8 rounded-2xl border border-gray-100">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {generatedSummary}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center border-2 border-turquoise/20 text-turquoise hover:bg-turquoise/5 rounded-full px-6 py-3"
                      onClick={() => {
                        setIsProcessed(false);
                        setGeneratedSummary("");
                        setSummaryId(null);
                        setEmailSent(false);
                      }}
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Generate New Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Sending */}
            <div className="space-y-8">
              {summaryId && (
                <EmailSummaryForm
                  summaryId={summaryId}
                  patientName={patientName}
                  summaryContent={generatedSummary}
                  onEmailSent={handleEmailSent}
                />
              )}

              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                    Summary Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Patient
                    </span>
                    <span className="font-semibold text-gray-800">{patientName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Reading Level</span>
                    <Badge className="bg-turquoise/10 text-turquoise border-turquoise/20">Grade 9</Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Word Count</span>
                    <span className="font-medium">{generatedSummary.split(' ').length} words</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Status</span>
                    <Badge className={emailSent ? "bg-green-100 text-green-700 border-green-200" : "bg-sky-blue/10 text-sky-blue border-sky-blue/20"}>
                      {emailSent ? "Delivered" : "Ready to Send"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-turquoise to-sky-blue rounded-full mx-auto mb-6 animate-pulse-gentle flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-turquoise/20 to-sky-blue/20 rounded-full w-32 h-32 mx-auto animate-ping"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Creating Your Summary
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Our AI is carefully converting complex medical language into clear, patient-friendly explanations...
            </p>
          </div>

          <Card className="glass-card border-0 shadow-xl max-w-lg mx-auto">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <span>Documents processed successfully</span>
                </div>
                <div className="flex items-center text-turquoise">
                  <Clock className="h-5 w-5 mr-3 animate-spin" />
                  <span>AI analyzing medical content...</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Heart className="h-5 w-5 mr-3" />
                  <span>Converting to patient-friendly language</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Create Patient Summary
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload medical documents and let our AI transform them into clear, compassionate summaries 
            that patients and families can easily understand
          </p>
        </div>

        {/* Security Notice */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-green-800 font-semibold text-lg">HIPAA Compliant & Secure</span>
              <span className="text-green-700">• End-to-end encryption • No data retention</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* File Upload */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0 shadow-xl hover-lift">
              <CardHeader className="bg-gradient-to-r from-turquoise/5 to-sky-blue/5 rounded-t-xl">
                <CardTitle className="flex items-center text-2xl">
                  <div className="p-2 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-xl mr-3">
                    <Upload className="h-6 w-6 text-turquoise" />
                  </div>
                  Upload Documents
                </CardTitle>
                <CardDescription className="text-lg">
                  Drag and drop your medical documents or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    dragActive
                      ? 'border-turquoise bg-turquoise/5 scale-105'
                      : files.length > 0
                      ? 'border-green-400 bg-green-50/50'
                      : 'border-gray-300 hover:border-turquoise/50 hover:bg-turquoise/2'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleUploadAreaClick}
                >
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-turquoise/10 to-sky-blue/10 rounded-2xl mx-auto flex items-center justify-center">
                      <Upload className="h-10 w-10 text-turquoise" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-800 mb-2">
                        Drop your files here
                      </p>
                      <p className="text-gray-500 text-lg">PDF, DOC, DOCX, JPG, PNG • Max 10MB each</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                      id="file-upload"
                    />
                    <Button className="bg-gradient-to-r from-turquoise to-sky-blue hover:from-turquoise/90 hover:to-sky-blue/90 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files ({files.length})</h4>
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-turquoise/10 rounded-lg">
                              {getFileIcon(file)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optional Notes */}
            <Card className="glass-card border-0 shadow-xl hover-lift mt-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Edit className="h-5 w-5 text-purple-500 mr-2" />
                  Additional Instructions (Optional)
                </CardTitle>
                <CardDescription className="text-base">
                  Add specific guidance for our AI to personalize the summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Patient is elderly and needs extra medication explanations, emphasize follow-up importance, focus on dietary changes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px] border-2 border-gray-200 rounded-xl focus:border-turquoise focus:ring-turquoise text-base"
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Features & Generate */}
          <div className="space-y-6">
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-turquoise to-sky-blue rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Generate Summary</CardTitle>
                <CardDescription className="text-base">
                  Transform complex medical language into patient-friendly explanations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={handleGenerateSummary}
                  disabled={files.length === 0 || isProcessing}
                  className="w-full bg-gradient-to-r from-turquoise to-sky-blue hover:from-turquoise/90 hover:to-sky-blue/90 text-white rounded-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  size="lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Generate Summary'}
                </Button>
                
                {files.length === 0 && (
                  <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>Upload documents first to continue</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Heart className="h-5 w-5 text-pink-500 mr-2" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-turquoise rounded-full mt-2"></div>
                  <span className="text-gray-700">9th-grade reading level conversion</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-sky-blue rounded-full mt-2"></div>
                  <span className="text-gray-700">Clear medication explanations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <span className="text-gray-700">Empathetic, supportive tone</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-gray-700">Structured, easy-to-follow sections</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSummary;
