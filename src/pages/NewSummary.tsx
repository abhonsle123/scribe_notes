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
import { processFile } from "@/utils/fileProcessor";
import EmailSummaryForm from "@/components/EmailSummaryForm";

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
      setFile(selectedFile);
      setSummary("");
      setExtractedText("");
      setPatientName("");
    }
  };

  const processDocument = async () => {
    if (!file || !user) return;

    setProcessing(true);
    
    try {
      // Process the file to extract text
      const text = await processFile(file);
      setExtractedText(text);

      // Get user's template
      const userTemplate = await getUserTemplate();
      
      // Convert to patient-friendly summary using the template
      const { data, error } = await supabase.functions.invoke('convert-to-patient-friendly', {
        body: { 
          text,
          template: userTemplate
        }
      });

      if (error) {
        throw error;
      }

      const generatedSummary = data.summary;
      setSummary(generatedSummary);
      
      // Extract patient name from the summary
      const extractedPatientName = extractPatientNameFromSummary(generatedSummary, file.name);
      setPatientName(extractedPatientName);

      // Save to database
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
      }

      toast({
        title: "Summary generated!",
        description: "Your discharge summary has been converted to patient-friendly language.",
      });
      
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error",
        description: "Failed to process the document. Please try again.",
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

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Email": return <Mail className="h-4 w-4" />;
      case "SMS": return <MessageSquare className="h-4 w-4" />;
      case "Patient Portal": return <Globe className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
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
            Select a file to upload and convert to a patient-friendly summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="upload-file" className="cursor-pointer">
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {file ? (
                  <>
                    <FileText className="h-6 w-6 mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-700">{file.name}</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload a file</p>
                  </>
                )}
              </div>
            </Label>
            <Input
              type="file"
              id="upload-file"
              className="hidden"
              onChange={handleFileChange}
            />
            {file && (
              <Button onClick={() => setFile(null)} variant="outline">
                Remove
              </Button>
            )}
          </div>
          <Button
            onClick={processDocument}
            disabled={processing || !file}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Summary
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
                <Input type="text" value={patientName} readOnly />
              </div>
            )}
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea 
                value={summary} 
                readOnly={previewMode}
                className="min-h-[150px] font-mono"
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
          onClose={handleCloseEmailForm}
        />
      )}
    </div>
  );
};

export default NewSummary;
