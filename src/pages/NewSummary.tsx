
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Upload, 
  FileText, 
  Loader2, 
  Send, 
  Mail,
  MessageSquare,
  Globe,
  Eye,
  Download
} from "lucide-react";
import { extractTextFromFile, validateFileForProcessing } from "@/utils/fileProcessor";
import { EmailSummaryForm } from "@/components/EmailSummaryForm";

const NewSummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [patientName, setPatientName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const extractPatientNameFromSummary = useCallback((summary: string, filename: string) => {
    // Attempt to extract patient name from the summary content
    const nameRegex = /(Patient:|Name:)\s*([A-Za-z\s]+)/i;
    const nameMatch = summary.match(nameRegex);

    if (nameMatch && nameMatch[2]) {
      return nameMatch[2].trim();
    }

    // If not found in summary, try to extract from the filename
    const filenameRegex = /^([A-Za-z\s]+)/;
    const filenameMatch = filename.match(filenameRegex);

    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1].trim();
    }

    return "Patient"; // Default if no name is found
  }, []);

  const getUserTemplate = async () => {
    if (!user) return null;
    
    try {
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('summary_template, custom_template')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userSettings) {
        if (userSettings.summary_template === 'custom' && userSettings.custom_template) {
          return userSettings.custom_template;
        } else {
          // Get the preset template
          const { data: preset } = await supabase
            .from('template_presets')
            .select('template_content')
            .eq('name', userSettings.summary_template)
            .eq('is_active', true)
            .maybeSingle();
          
          return preset?.template_content || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user template:', error);
      return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile.name, selectedFile.type);
      
      // Validate file
      const validation = validateFileForProcessing(selectedFile);
      if (!validation.isValid) {
        toast({
          title: "Invalid File",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setSummary("");
      setExtractedText("");
      setPatientName("");
    }
  };

  const processDocument = async () => {
    if (!file || !user) {
      console.log('Missing file or user:', { file: !!file, user: !!user });
      return;
    }

    setProcessing(true);
    console.log('Starting document processing for:', file.name);
    
    try {
      // Process the file to extract text
      console.log('Extracting text from file...');
      const text = await extractTextFromFile(file);
      console.log('Text extracted, length:', text.length);
      setExtractedText(text);

      // Get user's template
      console.log('Getting user template...');
      const userTemplate = await getUserTemplate();
      console.log('User template:', userTemplate ? 'Found' : 'Not found');
      
      // Convert to patient-friendly summary using the template
      console.log('Calling edge function to convert text...');
      const { data, error } = await supabase.functions.invoke('convert-to-patient-friendly', {
        body: { 
          text,
          template: userTemplate
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Summary generated successfully');
      const generatedSummary = data.summary;
      setSummary(generatedSummary);
      
      // Extract patient name from the summary
      const extractedPatientName = extractPatientNameFromSummary(generatedSummary, file.name);
      setPatientName(extractedPatientName);

      // Save to database
      console.log('Saving summary to database...');
      const { error: saveError } = await supabase
        .from('summaries')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          summary_content: generatedSummary,
          patient_name: extractedPatientName
        });

      if (saveError) {
        console.error('Error saving summary:', saveError);
        toast({
          title: "Warning",
          description: "Summary generated but could not be saved to history.",
          variant: "destructive",
        });
      } else {
        console.log('Summary saved successfully');
      }

      toast({
        title: "Summary generated!",
        description: "Your discharge summary has been converted to patient-friendly language.",
      });
      
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error",
        description: `Failed to process the document: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = () => {
    setShowEmailForm(true);
  };

  const handleCloseEmailForm = () => {
    setShowEmailForm(false);
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName || 'summary'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            New Summary
          </h1>
          <p className="text-gray-600 mt-1">
            Upload a discharge summary to convert it to patient-friendly language
          </p>
        </div>
      </div>

      {/* Upload Document Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Select a PDF, Word document, or text file to upload and convert to a patient-friendly summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="upload-file" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {file ? (
                  <>
                    <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload a file</p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word, or Text files up to 10MB
                    </p>
                  </>
                )}
              </div>
            </Label>
            <Input
              type="file"
              id="upload-file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            {file && (
              <Button onClick={() => setFile(null)} variant="outline">
                Remove
              </Button>
            )}
          </div>

          {extractedText && (
            <div className="mt-4">
              <Label>Extracted Text Preview</Label>
              <Textarea 
                value={extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')} 
                readOnly 
                className="mt-2 text-sm bg-gray-50"
                rows={4}
              />
            </div>
          )}

          <Button
            onClick={processDocument}
            disabled={processing || !file}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Patient-Friendly Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Display Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Summary</CardTitle>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>{previewMode ? 'Edit' : 'Preview'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadSummary}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
            <CardDescription>
              Review the generated summary and send it to the patient.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientName && (
              <div className="mb-2">
                <Label>Patient Name</Label>
                <Input 
                  type="text" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea 
                value={summary} 
                onChange={(e) => setSummary(e.target.value)}
                readOnly={previewMode}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleSendEmail}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Send to Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Email Form (Conditionally Rendered) */}
      {showEmailForm && (
        <EmailSummaryForm 
          summaryId=""
          patientName={patientName}
          summaryContent={summary}
          onEmailSent={handleCloseEmailForm}
        />
      )}
    </div>
  );
};

export default NewSummary;
